from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Category(models.Model):
    category = models.CharField(max_length=64)

    def __str__(self):
        return self.category
    

class Bid(models.Model):
    bid = models.FloatField(default=0, blank=True, null=True)
    user = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE, related_name="biddingUser")

    def __str__(self):
        return str(self.bid)


class Listing(models.Model):
    username = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name="user")
    title = models.CharField(max_length=30)
    desc = models.TextField()
    starting_bid = models.ForeignKey(Bid, on_delete=models.CASCADE, blank=True, related_name="currentBid")
    isActive = models.BooleanField(default=True)
    img_url = models.CharField(max_length=100)
    watchlist = models.ManyToManyField(User, blank=True, related_name="watchlist")
    category = models.ManyToManyField(Category, blank=True, related_name="ListingCategory")
    winner = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE, related_name="winner")

    def __str__(self):
        return self.title
    

class Comment(models.Model):
    user = models.ForeignKey(User, blank=True, on_delete=models.CASCADE)
    listing = models.ForeignKey(Listing, blank=True, on_delete=models.CASCADE, related_name="commentListing")
    comment = models.TextField(blank=True, null=True)



