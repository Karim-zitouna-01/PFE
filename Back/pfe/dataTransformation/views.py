from django.shortcuts import render

# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status  # Import for status codes

# Import your Dataset model (if applicable)
from dataSets.models import Dataset


# Import the conversion function
from dataTransformation.convert import convert_column, discretize_column, sample_data

class ConvertView(APIView):
  

  def post(self, request):
    dataset_id = request.data.get('dataset_id')
    column_name = request.data.get('column_name')
    target_type = request.data.get('target_type')

    if not all([dataset_id, column_name, target_type]):
      return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    # Logic to access and open the dataset based on dataset_id
    try:
      dataset = Dataset.objects.get(pk=dataset_id)
      dataset_path = dataset.uploaded_file.path  
    except Dataset.DoesNotExist:
      return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
      df = convert_column(dataset_path, column_name, target_type)
      # Logic to save the modified DataFrame back to the dataset

      #  Save the modified data back to the same file (consider backup)
      df.to_csv(dataset_path, index=False)  # Overwrites existing file
      return Response({'message': 'Column conversion successful'})



    except ValueError as e:
      return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DiscretizeView(APIView):
  

  def post(self, request):
    dataset_id = request.data.get('dataset_id')
    column_name = request.data.get('column_name')
    bins = request.data.get('bins')
    names = request.data.get('names', None)
    strategy = request.data.get('strategy', 'cut')
    print(request.data)

    if not all([dataset_id, column_name, bins, strategy]):
      return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    if strategy not in ['cut', 'qcut']:
      return Response({'error': 'Invalid discretization strategy'}, status=status.HTTP_400_BAD_REQUEST)

    # Logic to access and open the dataset based on dataset_id
    try:
      dataset = Dataset.objects.get(pk=dataset_id)
      dataset_path = dataset.uploaded_file.path  # Assuming 'uploaded_file' field
    except Dataset.DoesNotExist:
      return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
      df = discretize_column(dataset_path, column_name, bins, names, strategy)
      # Logic to save the modified DataFrame back to the dataset

      #  : Overwrites the existing dataset file (consider backup)
      df.to_csv(dataset_path, index=False)  # Overwrites existing file
      return Response({'message': 'Column discretized successfully'})



    except ValueError as e:
      return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)






class SampleView(APIView):
  

  def post(self, request):
    dataset_id = request.data.get('dataset_id')
    target_column = request.data.get('target_column')
    sampling_method = request.data.get('sampling_method')
    minority_class = request.data.get('minority_class', None)
    print(request.data)
    # Add optional keyword arguments based on your chosen sampling methods (e.g., k_neighbors for NearMiss)

    if not all([dataset_id, target_column, sampling_method]):
      return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

    if sampling_method not in ['SMOTE', 'ADASYN', 'RandomOverSampler', 'RandomUnderSampler', 'NearMiss', 'ClusterCentroids']:
      return Response({'error': 'Unsupported sampling method'}, status=status.HTTP_400_BAD_REQUEST)

    # Logic to access and open the dataset based on dataset_id
    try:
      dataset = Dataset.objects.get(pk=dataset_id)
      dataset_path = dataset.uploaded_file.path  
    except Dataset.DoesNotExist:
      return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
      
      df = sample_data(dataset_path, target_column, sampling_method, minority_class=minority_class,
                       
                       )
      # Logic to save the modified DataFrame back to the dataset

      # : Overwrites the existing dataset file (consider backup)
      df.to_csv(dataset_path, index=False)  # Overwrites existing file
      return Response({'message': 'Data sampled successfully'})



    except ValueError as e:
      return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'message': 'Data sampled successfully'})



