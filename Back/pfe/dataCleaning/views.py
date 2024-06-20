from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from dataSets.models import Dataset  



from .clean import impute_missing_values, handle_outliers  # Import the function


class ImputeMissingValuesView(APIView):
  def post(self, request):
    dataset_id = request.data.get('dataset_id')
    column_name = request.data.get('column_name')
    imputation_method = request.data.get('imputation_method')

    if not all([dataset_id, imputation_method]):
      return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    try:
      dataset = Dataset.objects.get(pk=dataset_id)
      dataset_path = dataset.uploaded_file.path  
    except Dataset.DoesNotExist:
      return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
      df = impute_missing_values(dataset_path, column_name, imputation_method)
      # Logic to save the modified DataFrame back to the dataset (similar to ConvertView)
      # Overwrite existing file (consider backup)
      df.to_csv(dataset_path, index=False)


      return Response({'message': 'Missing values imputed successfully'})
    except ValueError as e:
      return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)




class HandleOutliersView(APIView):
  def post(self, request):
    dataset_id = request.data.get('dataset_id')
    column_name = request.data.get('column_name')
    outlier_handling = request.data.get('outlier_handling')
    threshold = request.data.get('threshold', None)  # Optional threshold

    if not all([dataset_id, column_name, outlier_handling]):
      return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    if outlier_handling == 'remove' and threshold is None:
      return Response({'error': "Threshold required for 'remove' method"}, status=status.HTTP_400_BAD_REQUEST)

    try:
      dataset = Dataset.objects.get(pk=dataset_id)
      dataset_path = dataset.uploaded_file.path  
    except Dataset.DoesNotExist:
      return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
      df = handle_outliers(dataset_path, column_name, outlier_handling, threshold)
      # Logic to save the modified DataFrame back to the dataset (similar to ConvertView)
      df.to_csv(dataset_path, index=False)
      
      return Response({'message': 'Outliers handled successfully'})
    except ValueError as e:
      return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)