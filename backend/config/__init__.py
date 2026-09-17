try:
    import MySQLdb  # Prefer native mysqlclient
except ImportError:
    try:
        import pymysql
        pymysql.install_as_MySQLdb()
    except ImportError:
        pass
