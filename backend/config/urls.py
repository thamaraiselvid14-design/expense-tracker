from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect

urlpatterns = [
    # Redirect root URL to the REST API browsable explorer
    path('', lambda request: redirect('/api/expenses/', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/expenses/', include('expenses.urls')),
]
