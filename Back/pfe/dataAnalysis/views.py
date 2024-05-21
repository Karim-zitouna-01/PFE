from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from dataAnalysis.analyse import get_descriptive_stats, get_column_stats, plot_distribution_categorical, plot_distribution_numeric, plot_relationship
from dataSets.models import Dataset  # Assuming you have a Dataset model
import pandas as pd
from io import BytesIO
import matplotlib.pyplot as plt
from django.http import HttpResponse
class DescriptiveStatsView(APIView):
  """
  API view to get descriptive statistics for the entire dataset.
  """
  def get(self, request):
    dataset_id = request.GET.get('dataset_id')
    # dataset_id = request.data.get('dataset_id')
    print(request.data)
    if not dataset_id:
      return Response({'error': 'Missing required field: dataset_id'}, status=400)

    try:
      dataset = Dataset.objects.get(pk=dataset_id)
      dataset_path = dataset.uploaded_file.path  # Assuming 'uploaded_file' field
    except Dataset.DoesNotExist:
      return Response({'error': 'Dataset not found'}, status=404)

    try:
      df = pd.read_csv(dataset_path)
      stats = get_descriptive_stats(df)
      data = {"data_stats": stats, "num_rows": len(df), "num_columns": len(df.columns)}
      return Response(data)
    except Exception as e:
      return Response({'error': f"Error processing data: {str(e)}"}, status=400)

class ColumnStatsView(APIView):
  """
  API view to get descriptive statistics for a specific column.
  """
  def get(self, request):
    print(request.data)
    dataset_id = request.GET.get('dataset_id')
    column_name=request.GET.get('column_name')

    # dataset_id = request.data.get('dataset_id')
    # column_name=request.data.get('column_name')
    if not dataset_id:
      return Response({'error': 'Missing required field: dataset_id'}, status=400)

    try:
      dataset = Dataset.objects.get(pk=dataset_id)
      dataset_path = dataset.uploaded_file.path  # Assuming 'uploaded_file' field
    except Dataset.DoesNotExist:
      return Response({'error': 'Dataset not found'}, status=404)

    try:
      df = pd.read_csv(dataset_path)
      stats = get_column_stats(df, column_name)
      return Response(stats)
    except Exception as e:
      return Response({'error': f"Error processing data: {str(e)}"}, status=400)




class DistributionNumericView(APIView):
  """
  API view to get the distribution of a numeric feature (box plot).
  """
  def get(self, request, format=None):
    # ... (similar error handling and dataset retrieval from previous views)
    dataset_id = request.GET.get('dataset_id')
    column_name=request.GET.get('column_name')

    # dataset_id = request.data.get('dataset_id')
    # column_name=request.data.get('column_name')

    if not dataset_id:
      return Response({'error': 'Missing required field: dataset_id'}, status=400)

    try:
      dataset = Dataset.objects.get(pk=dataset_id)
      dataset_path = dataset.uploaded_file.path  # Assuming 'uploaded_file' field
    except Dataset.DoesNotExist:
      return Response({'error': 'Dataset not found'}, status=404)
    
    df = pd.read_csv(dataset_path)

    if not df[column_name].dtype in ['int64', 'float64']:
      return Response({'error': f"Column '{column_name}' is not numeric."}, status=400)

    try:
        plt.figure(figsize=(8, 6))
        df[column_name].plot(kind='box')
        plt.title(f"Distribution of {column_name}")
        plt.xlabel(column_name)
        plt.ylabel('Values')
        plt.grid(True)
        # Create a HttpResponse object with the appropriate content type
        response = HttpResponse(content_type="image/png")
        # Save the plot directly to the response object
        plt.savefig(response, format="png")
        return response
    except Exception as e:
        return Response({'error': f"Error generating plot: {str(e)}"}, status=400)

class DistributionCategoricalView(APIView):
  """
  API view to get the distribution of a categorical feature (bar or pie chart).
  """
  def get(self, request, format=None):
    # ... (similar error handling and dataset retrieval from previous views)
    
    dataset_id = request.GET.get('dataset_id')
    column_name=request.GET.get('column_name')
    chart_type=request.GET.get('chart_type')

    # dataset_id = request.data.get('dataset_id')
    # column_name=request.data.get('column_name')
    # chart_type=request.data.get('chart_type')

    if not dataset_id:
      return Response({'error': 'Missing required field: dataset_id'}, status=400)

    try:
      dataset = Dataset.objects.get(pk=dataset_id)
      dataset_path = dataset.uploaded_file.path  # Assuming 'uploaded_file' field
    except Dataset.DoesNotExist:
      return Response({'error': 'Dataset not found'}, status=404)
    
    df = pd.read_csv(dataset_path)

    if chart_type not in ['bar', 'pie']:
      return Response({'error': f"Invalid chart type: {chart_type}"}, status=400)

    try:
        plt.figure(figsize=(8, 6))
        if chart_type == 'bar':
            df[column_name].value_counts().plot(kind='bar')
        elif chart_type == 'pie':
            df[column_name].value_counts().plot(kind='pie')
        plt.title(f"Distribution of {column_name}")
        plt.xlabel(column_name)
        plt.ylabel('Count')
        plt.grid(True)
        # Create a HttpResponse object with the appropriate content type
        response = HttpResponse(content_type="image/png")
        # Save the plot directly to the response object
        plt.savefig(response, format="png")
        return response
    except Exception as e:
      return Response({'error': f"Error generating plot: {str(e)}"}, status=400)

class RelationshipView(APIView):
  """
  API view to get the relationship between two features (scatter plot).
  """
  def get(self, request, format=None):
    # ... (similar error handling and dataset retrieval from previous views)

    dataset_id = request.GET.get('dataset_id')
    feature1=request.GET.get('feature1')
    feature2=request.GET.get('feature2')

    # dataset_id = request.data.get('dataset_id')
    # feature1=request.data.get('feature1')
    # feature2=request.data.get('feature2')

    if not dataset_id:
      return Response({'error': 'Missing required field: dataset_id'}, status=400)

    try:
      dataset = Dataset.objects.get(pk=dataset_id)
      dataset_path = dataset.uploaded_file.path  # Assuming 'uploaded_file' field
    except Dataset.DoesNotExist:
      return Response({'error': 'Dataset not found'}, status=404)
    
    df = pd.read_csv(dataset_path)


    try:
        plt.figure(figsize=(8, 6))
        plt.scatter(df[feature1], df[feature2])
        plt.title(f"Relationship between {feature1} and {feature2}")
        plt.xlabel(feature1)
        plt.ylabel(feature2)
        plt.grid(True)
        # Create a HttpResponse object with the appropriate content type
        response = HttpResponse(content_type="image/png")
        # Save the plot directly to the response object
        plt.savefig(response, format="png")
        return response
    except Exception as e:
      return Response({'error': f"Error generating plot: {str(e)}"}, status=400)
