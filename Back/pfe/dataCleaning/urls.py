from django.urls import path
from dataCleaning.views import ImputeMissingValuesView, HandleOutliersView

urlpatterns = [
    path('/impute/', ImputeMissingValuesView.as_view(), name='impute-data'),

    path('/handle-outliers/', HandleOutliersView.as_view(), name='handle-outliers'),
]