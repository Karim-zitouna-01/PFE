from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST
from django.http import HttpResponse
from io import BytesIO
import zipfile


# Import your dataset model
from dataSets.models import Dataset

import pandas as pd


class DataDivisionView(APIView):
    def post(self, request):

        print(request.data)
        dataset_id = request.data.get('dataset_id')
        test_size = float(request.data.get('test_size'))
        train_size = float(request.data.get('train_size'))
        

        if not dataset_id or not test_size or not train_size:
            return Response({'error': 'Missing required data.'}, status=HTTP_400_BAD_REQUEST)

        try:
            # Retrieve the dataset object based on the ID
            dataset = Dataset.objects.get(pk=dataset_id)

            # Validate and handle test/train size (ensure they add up to 1)
            if test_size + train_size != 1:
                return Response({'error': 'Test and train size must add up to 1.'}, status=HTTP_400_BAD_REQUEST)

            # Access the dataset data 
            # Access data stored as a field in the dataset model
            data = dataset.uploaded_file  # Assuming data is stored as a field

            # Perform data division using pandas
            data = pd.read_csv(data)
            test_data = data.sample(frac=test_size)
            train_data = data.drop(test_data.index)

            # Create a BytesIO object to act as an in-memory file
            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
                # Write test data to the ZIP archive
                test_data_csv = test_data.to_csv(index=False)
                zip_file.writestr(f'{dataset.file_name}-test.csv', test_data_csv.encode('utf-8'))

                # Write train data to the ZIP archive
                train_data_csv = train_data.to_csv(index=False)
                zip_file.writestr(f'{dataset.file_name}-train.csv', train_data_csv.encode('utf-8'))

            # Set response content type and headers
            response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
            response['Content-Disposition'] = f'attachment; filename={dataset.file_name}-data.zip'

            return response

        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset with provided ID not found.'}, status=HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'An error occurred: {e}'}, status=HTTP_400_BAD_REQUEST)
