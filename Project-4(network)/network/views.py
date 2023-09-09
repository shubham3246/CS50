from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import *
import json


from django.core.paginator import Paginator

def index(request):
    if request.user.is_authenticated:
        post_list = Post.objects.all().order_by('-time')
        paginator = Paginator(post_list, 10)  # Set the number of posts per page
        page_number = request.GET.get('page')
        posts = paginator.get_page(page_number)
        return render(request, "network/index.html", {"posts": posts})
    return HttpResponseRedirect('login')

@csrf_exempt
@login_required
def edit_post(request):
    if request.method  == "POST":
        
        data = json.loads(request.body)
        id = data.get('id')
        like = data.get('like')

        post = Post.objects.get(id=id)

        if(like != None and like == True):
            post.likes.add(request.user)

        elif(like != None and like == False):
            post.likes.remove(request.user)

        else:
            newPost = data['text']
            post.post = newPost
            post.save()
    
    return HttpResponse()


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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


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
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
    
def newpost(request):
    if request.user.is_authenticated:
        if request.method == "POST":
            data = request.POST["newPost"]
            newPost = Post(user = request.user, post = data)
            newPost.save()
            
        return render(request, "network/newpost.html")
    
    return HttpResponseRedirect('login')

@login_required
def profile(request, username):
    follow = User.objects.get(username = username)
    currentUser = request.user
    print(follow, "----", currentUser)
    is_following = follow.followers.filter(username=currentUser.username).exists()

    if request.method == "POST":
        if is_following:
            follow.followers.remove(currentUser)
            currentUser.following.remove(follow)
        else:
            follow.followers.add(currentUser)
            currentUser.following.add(follow)

        # current = request.user

        # if current.following.filter(username = follow.username).exists():
        #     current.following.remove(follow)
        # else:
        #     current.following.add(follow)

        is_following = not is_following

    user = User.objects.get(username = username)
    data = Post.objects.filter(user = user).order_by('-time')

    return render(request, "network/profile.html", {"postData":data, "userData":user, "is_following":is_following})


def following(request):
    if request.user.is_authenticated:
        currentUser = request.user
        followingList = User.objects.get(username = currentUser.username)

        post = None
        posts = []

        for list in followingList.following.all():
            if list != request.user:
                # print(list, ': li')
                post=Post.objects.filter(user = list)
                posts.extend(post)

        if posts:
            posts.reverse()

        return render(request, "network/following.html", {"posts": posts})
    
    return HttpResponseRedirect('login')
