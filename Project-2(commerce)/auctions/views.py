from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse

from .models import *


def index(request):
    listings = Listing.objects.all()
    return render(request, "auctions/index.html", {"content": listings})


def listing(request, list):
    listings = Listing.objects.get(id = list)
    if listings.isActive == False:
        check = request.user in listings.watchlist.all()
        comments = Comment.objects.filter(listing = listings)
        return render(request, "auctions/listing.html", {"list": listings, "checker":check, "comments":comments})
    # comments = Comment.objects.filter(user = )
    messege = None
    if request.method == "POST":
        checkistrue = request.POST.get("is_true")
        checkisfalse = request.POST.get("is_false")
        checkuser = request.POST.get("close")

        if checkuser:
            listings.isActive = False
            listings.winner = listings.starting_bid.user
            listings.save()
            check = request.user in listings.watchlist.all()
            comments = Comment.objects.filter(listing = listings)
            
            print(listings.winner)
            return render(request, "auctions/listing.html", {
                "list": listings, 
                "checker":check, 
                "comments":comments, 
                "isuser":False,
                "message":"The auction is closed",
            })

        elif checkistrue:
            listings.watchlist.add(request.user)
            
        elif checkisfalse:
            listings.watchlist.remove(request.user)

        else:
            currentBid = request.POST["biddingAmount"]
            # print(comment)
            if currentBid:
                listing = Listing.objects.get(id=list)
                if float(currentBid) > listing.starting_bid.bid:
                    newbid = Bid(bid=currentBid, user=request.user)
                    newbid.save()

                    listing.starting_bid = newbid
                    listing.save()
                    # return redirect(reverse("listing"))
                    listings = Listing.objects.get(id=list)
                
                elif float(currentBid) < listing.starting_bid.bid:
                    messege = "Enter a bid greater than current bid"
                else:
                    messege = "Enter a valid bid"
                    

    check = request.user in listings.watchlist.all()
    comments = Comment.objects.filter(listing = listings)

    isuser = False
    if listings.username == request.user:
        isuser = True
    return render(request, "auctions/listing.html", {"list": listings, "checker":check, "comments":comments, "isuser":isuser, "messege": messege})


def comments(request, id):
    # listId = request.
    listings = Listing.objects.get(id = id)
    if request.method == "POST":
        comment = request.POST["inputComments"]
        user = request.user
        # listing = Listing.objects.get(id=id)
        createComment = Comment(user=user, listing=listings, comment=comment)
        createComment.save()
        # print(createComment)
    # return redirect(reverse('listing', id))
    check = request.user in listings.watchlist.all()
    comments = Comment.objects.filter(listing = listings)
    return render(request, "auctions/listing.html", {"list": listings, "checker":check, "comments":comments})



def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")
    

def create(request):
    # print(request.method)
    # print(request.user.is_authenticated)
    if request.method == "POST" and request.user.is_authenticated:
        title = request.POST["title"]
        desc = request.POST["desc"]
        img_url = request.POST["img_url"]
        starting_bid = request.POST["starting_bid"]
        category = request.POST.get("category")

        bid = Bid(bid=starting_bid)
        bid.save()
        # print(bid,"+")
        # listcategory = Category.objects.get(category = category)
        listing = Listing(username = request.user, title=title, desc = desc, img_url = img_url, starting_bid = bid)
        listing.save()
        if category:
            category = Category.objects.get(id=category)
            listing.category.set([category])

        return redirect(reverse("index"))

    category = Category.objects.all()
    return render(request, "auctions/create.html", {"categories":category})


def watchlist(request):
    if request.user.is_authenticated:
        user = request.user
        watchlist = user.watchlist.all()
        # print(watchlist[0])
        return render(request, "auctions/watchlist.html", {"content": watchlist})
    

def categories(request):
    if request.user.is_authenticated:
        categories = Category.objects.all()
        return render(request, "auctions/categories.html", {"list": categories})
    

def category(request, cat):
    if request.user.is_authenticated:
        categories = Category.objects.get(category = cat)
        data = categories.ListingCategory.all()
        return render(request, "auctions/category.html", {"content":data})
    

