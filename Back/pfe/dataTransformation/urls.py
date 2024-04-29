from django.urls import path
from dataTransformation.views import ConvertView, DiscretizeView, SampleView

urlpatterns = [
    path('/convert/', ConvertView.as_view(), name='convert-data'),
    path('/discretize/', DiscretizeView.as_view(), name='dicretize-data'),   
    path('/sample/', SampleView.as_view(), name='dicretize-data'), 
]