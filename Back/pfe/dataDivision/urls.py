from django.urls import path
from dataDivision.views import DataDivisionView

urlpatterns = [
    path('divide/', DataDivisionView.as_view(), name='data_division'),
    
]