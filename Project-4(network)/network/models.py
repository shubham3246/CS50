from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField('self', related_name="followersUser", symmetrical=False, null=True, blank=True)
    following = models.ManyToManyField('self', related_name="followingUser", symmetrical=False, null=True, blank=True)


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.TextField()
    time = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name='likepost')

    def __str__(self):
        return self.post
