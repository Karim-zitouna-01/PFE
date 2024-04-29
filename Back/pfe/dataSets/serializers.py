from rest_framework import serializers
from .models import Dataset
import os
class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ['id', 'file_name', 'uploaded_file', 'status']  # Include owner field

    def create(self, validated_data):
        user = self.context.get('user')  # Access user from context
        validated_data['owner'] = user
        return super().create(validated_data)
    


   
 




