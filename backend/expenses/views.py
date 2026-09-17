from django.db.models import Sum, Avg, Max, Count, Q
from django.http import Http404
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from .models import Expense
from .serializers import ExpenseSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet providing full CRUD operations for the Expense model:
      - POST   /api/expenses/        → create
      - GET    /api/expenses/        → list all (with category, search, and ordering filters)
      - GET    /api/expenses/{id}/   → retrieve one
      - PUT    /api/expenses/{id}/   → update (full)
      - PATCH  /api/expenses/{id}/   → update (partial)
      - DELETE /api/expenses/{id}/   → delete
    """
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

    def get_object(self):
        """
        Retrieve a single expense by ID, returning a clear 404 message if not found.
        """
        try:
            return super().get_object()
        except (Http404, Expense.DoesNotExist):
            raise NotFound(detail=f"Expense with ID '{self.kwargs.get('pk')}' was not found.")

    def get_queryset(self):
        """
        Apply query parameter filters:
          - category: filter by category name (?category=Food)
          - search: search by title (?search=lunch)
          - ordering: sort by date or amount (?ordering=-date, ?ordering=amount)
        """
        queryset = Expense.objects.all()
        params = self.request.query_params

        # 1. Category filter (?category=Food)
        category = params.get('category')
        if category and category.lower() != 'all':
            queryset = queryset.filter(category__iexact=category)

        # 2. Search by title (?search=lunch)
        search = params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search.strip()) | Q(description__icontains=search.strip())
            )

        # 3. Ordering by date or amount (?ordering=-date, ?ordering=amount)
        ordering = params.get('ordering', '-date')
        allowed_ordering = [
            'date', '-date',
            'amount', '-amount',
            'title', '-title',
            'created_at', '-created_at'
        ]
        if ordering in allowed_ordering:
            queryset = queryset.order_by(ordering, '-id')
        else:
            queryset = queryset.order_by('-date', '-created_at', '-id')

        return queryset

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Analytical endpoint providing total, monthly metrics, and category breakdown.
        URL: /api/expenses/summary/
        """
        expenses = Expense.objects.all()
        total_count = expenses.count()
        total_sum = expenses.aggregate(total=Sum('amount'))['total'] or 0.0
        total_spent = float(total_sum)

        # Current month statistics
        now = timezone.now()
        current_month_expenses = expenses.filter(date__year=now.year, date__month=now.month)
        current_month_sum = current_month_expenses.aggregate(total=Sum('amount'))['total'] or 0.0
        current_month_spent = float(current_month_sum)
        current_month_count = current_month_expenses.count()

        # Average and max
        avg_sum = expenses.aggregate(avg=Avg('amount'))['avg'] or 0.0
        average_expense = round(float(avg_sum), 2)
        max_sum = expenses.aggregate(max=Max('amount'))['max'] or 0.0
        highest_expense = float(max_sum)

        # Category breakdown
        category_data = (
            expenses.values('category')
            .annotate(total=Sum('amount'), count=Count('id'))
            .order_by('-total')
        )
        category_breakdown = []
        for cat in category_data:
            cat_total = float(cat['total'])
            percentage = round((cat_total / total_spent * 100), 1) if total_spent > 0 else 0.0
            category_breakdown.append({
                'category': cat['category'],
                'total': cat_total,
                'count': cat['count'],
                'percentage': percentage
            })

        return Response({
            'total_spent': total_spent,
            'total_count': total_count,
            'current_month_spent': current_month_spent,
            'current_month_count': current_month_count,
            'average_expense': average_expense,
            'highest_expense': highest_expense,
            'category_breakdown': category_breakdown,
        }, status=status.HTTP_200_OK)
