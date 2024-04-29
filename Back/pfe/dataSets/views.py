import jwt, os
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from django.http import FileResponse

from users.models import User

from .models import Dataset
from .serializers import DatasetSerializer
from rest_framework.generics import ListAPIView, DestroyAPIView 
from django.http import HttpResponse


class UploadView(APIView):
    """API view for uploading datasets with token-based authentication."""

    def post(self, request):
        try:
            token = request.COOKIES.get('jwt')
            if not token:
                raise AuthenticationFailed('Unauthenticated!')

            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.filter(id=payload['id']).first()
            self.request.user = user  # Set user in request context

            serializer = DatasetSerializer(data=request.data, context={'user': user})
            if serializer.is_valid():
                serializer.save()
                print(request.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            print(request.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated!')
        except jwt.DecodeError:
            raise AuthenticationFailed('Invalid token!')


class UserDatasetsView(ListAPIView):
    

    serializer_class = DatasetSerializer
    def get_queryset(self):
        try:
            token =self.request.COOKIES.get('jwt')
            if not token:
                raise AuthenticationFailed('Unauthenticated!')

            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.filter(id=payload['id']).first()
            self.request.user = user  # Set user in request context

            print(self.request.data)
            return Dataset.objects.filter(owner=user)
        
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated!')
        except jwt.DecodeError:
            raise AuthenticationFailed('Invalid token!')

class UserDatasetDeleteView(DestroyAPIView):
    """View to delete a dataset owned by the authenticated user."""
    #permission_classes = [IsAuthenticated]
    serializer_class = DatasetSerializer

    def get_queryset(self):
        try:
            token =self.request.COOKIES.get('jwt')
            if not token:
                raise AuthenticationFailed('Unauthenticated!')

            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.filter(id=payload['id']).first()

            print(self.request.data)
            return Dataset.objects.filter(owner=user)
        
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated!')
        except jwt.DecodeError:
            raise AuthenticationFailed('Invalid token!')

    def perform_destroy(self, instance):
        instance.uploaded_file.delete() #delete the file from the disk
        instance.delete()


class DatasetExportView(APIView):

    def get(self, request, pk):
        try:
            token = self.request.COOKIES.get('jwt')
            if not token:
                raise AuthenticationFailed('Unauthenticated!')
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(pk=payload['id'])  # Assuming 'id' is the primary key field
            self.request.user = user
            try:
                dataset = Dataset.objects.get(pk=pk, owner=request.user)  # Filter by owner

                # Check if file exists
                file_path = dataset.uploaded_file.path  # Assuming 'file' is the field storing the file path
                if not os.path.exists(file_path):
                    return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

                # Read file content into memory
                with open(file_path, 'rb') as dataset_file:
                    file_content = dataset_file.read()

                # Create in-memory file-like object
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename={dataset.file_name}.csv'  # Set filename dynamically

                # Write content to the response
                response.write(file_content)

                return response

            except Dataset.DoesNotExist:
                return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated!')
        except jwt.DecodeError:
            raise AuthenticationFailed('Invalid token!')


class DatasetOpenView(APIView):

    def get(self, request, pk):
        try:
            token = self.request.COOKIES.get('jwt')
            if not token:
                raise AuthenticationFailed('Unauthenticated!')
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(pk=payload['id'])  # Assuming 'id' is the primary key field
            self.request.user = user
            try:
                dataset = Dataset.objects.get(pk=pk, owner=request.user)  # Filter by owner

                # Check if file exists
                file_path = dataset.uploaded_file.path  # Assuming 'file' is the field storing the file path
                if not os.path.exists(file_path):
                    return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

                # Read file content into memory
                with open(file_path, 'rb') as dataset_file:
                    file_content = dataset_file.read()

                # Create in-memory file-like object
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename={dataset.file_name}.csv'  # Set filename dynamically

                # Write content to the response
                response.write(file_content)
                #file status= opened 
                dataset.status=True
                dataset.save()
                print(self.request)
                return response
            
            except Dataset.DoesNotExist:
                return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
            print(response)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated!')
        except jwt.DecodeError:
            raise AuthenticationFailed('Invalid token!')






class CloseFileView(APIView):

    def get(self, request, pk):
        try:
            token = self.request.COOKIES.get('jwt')
            if not token:
                raise AuthenticationFailed('Unauthenticated!')
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(pk=payload['id'])  # Assuming 'id' is the primary key field
            self.request.user = user
            try:
                dataset = Dataset.objects.get(pk=pk, owner=request.user)  # Filter by owner

                # Check if file exists
                file_path = dataset.uploaded_file.path  # Assuming 'file' is the field storing the file path
                if not os.path.exists(file_path):
                    return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

                dataset.status = False
                dataset.save()
                return Response({'message': 'Dataset closed successfully'})

            except Dataset.DoesNotExist:
                return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated!')
        except jwt.DecodeError:
            raise AuthenticationFailed('Invalid token!')




    
"""#to represent data in angular page (change view name)
class DatasetExportView(APIView):

    def get(self, request, pk):
        try:
            token = self.request.COOKIES.get('jwt')
            if not token:
                raise AuthenticationFailed('Unauthenticated!')
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            user = User.objects.get(pk=payload['id'])  # Assuming 'id' is the primary key field
            self.request.user = user
            try:
                dataset = Dataset.objects.get(pk=pk, owner=request.user)  # Filter by owner

                # Check if file exists
                file_path = dataset.uploaded_file.path  # Assuming 'file' is the field storing the file path
                if not os.path.exists(file_path):
                    return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

                # Serve the file using Django's file serving
                #return FileResponse(open(file_path, 'rb'))

                with open(file_path, 'rb') as f:
                    response = HttpResponse(f.read(), content_type='text/csv')
                    response['Content-Disposition'] = f'attachment; filename="{dataset.file_name}"'
                    return response

            except Dataset.DoesNotExist:
                return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
            except PermissionError:  # Add PermissionError handling (optional)
                return Response({'error': 'You are not authorized to access this dataset'}, status=status.HTTP_403_FORBIDDEN)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated!')
        except jwt.DecodeError:
            raise AuthenticationFailed('Invalid token!')
"""
