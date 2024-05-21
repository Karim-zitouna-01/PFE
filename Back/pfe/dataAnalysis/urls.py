from django.urls import path
from dataAnalysis.views import DescriptiveStatsView, ColumnStatsView, DistributionNumericView, DistributionCategoricalView, RelationshipView

urlpatterns = [
    path('/datasetStats', DescriptiveStatsView.as_view(), name='describe-dataset'),
    path('/columnStats', ColumnStatsView.as_view(), name='describe-column'),

    path('/distribution_of_num', DistributionNumericView.as_view(), name='distribution_of_num'),    path('/distribution_of_num', DistributionNumericView.as_view(), name='distribution_of_num'),
    path('/distribution_of_cat', DistributionCategoricalView.as_view(), name='distribution_of_cat'),
    path('/relationship', RelationshipView.as_view(), name='relationship'),


    


]