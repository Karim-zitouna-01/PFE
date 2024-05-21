from django.urls import path
from .views import UploadView, UserDatasetsView, UserDatasetDeleteView,DatasetExportView, DatasetOpenView, CloseFileView, OverwriteDataset

urlpatterns = [
    path('upload', UploadView.as_view()),
    path('my-datasets', UserDatasetsView.as_view()),
    path('my-datasets/<int:pk>/delete', UserDatasetDeleteView.as_view()),
    path('my-datasets/open/<int:pk>', DatasetOpenView.as_view()),#keep it for data presentation in angular
    path('my-datasets/close/<int:pk>', CloseFileView.as_view()),
    path('my-datasets/export/<int:pk>/',DatasetExportView.as_view()),
    path('my-datasets/overwrite/<int:pk>/',OverwriteDataset.as_view()),

]