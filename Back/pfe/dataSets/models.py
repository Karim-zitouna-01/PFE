from django.db import models
from users.models import User

class Dataset(models.Model):
  file_name = models.CharField(max_length=255)
  uploaded_file = models.FileField(upload_to='datasets/')  
  status = models.BooleanField(default=False)  # Activated or not
  # Add the foreign key relationship
  owner = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to User model
  
    
  def __str__(self):
    return self.file_name


