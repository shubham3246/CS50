from django.shortcuts import render, redirect, HttpResponse
from django.urls import reverse
from markdown2 import markdown
import random
from django.contrib import messages
from . import util


def routing(request):
    query = request.POST.get('q')
    if query:
        if util.get_entry(query):
            url = reverse('title', kwargs={'entry': query})
            return redirect(url)
        
        list = []
        for x in util.list_entries():
            if query.lower() in x.lower():
                list.append(x)
        
        if len(list) > 0:
            request.session['store'] = list
            print("List session stored", request.session.get('store'))
            return redirect('index')
        
        else :
            request.session['store'] = None
            return redirect(title, entry = query)


def index(request):
    content = None
    if request.method == 'POST':
        if request.POST.get('q'):
            print("going to routing")
            return routing(request)
    
    elif request.session.get('store'):
        content = request.session.get('store')
        del request.session['store']

        print('content:',content)
        return render(request, "encyclopedia/index.html", {
            "entries": content
        })
    
    return render(request, "encyclopedia/index.html", {"entries": util.list_entries()})


def title(request, entry):
    content = None
    if request.method == 'POST':
        query = request.POST.get('q')
        if query:
            return routing(request)   
    
    elif request.session.get('store'):
        content = request.session.get('store')
        del request.session['store']

        return render(request, "encyclopedia/title.html", {
            "content": content
        })
    
    if entry == "None" or entry == None or util.get_entry(entry) == None:
        return render (request, "encyclopedia/title.html", {'content':None})
    
    return render(request, "encyclopedia/title.html", {'entries': entry, 'content':markdown(util.get_entry(entry))})
    

def create(request):
    return redirect('edit', editable = "None")


def remove_empty_lines(text):
    if text:
        lines = text.split("\n")
        non_empty_lines = [line for line in lines if line.strip()]
        return "\n".join(non_empty_lines)

def edit(request, editable):
    if request.method == 'POST': 
        heading = request.POST.get('heading')
        new_data = request.POST.get('new_data')
        edit_data = request.POST.get('edit_data')
        
        if edit_data:
            util.save_entry(heading, f"# {heading}\n"+edit_data)
            return redirect('title', entry=editable)
        elif new_data:
            if(util.get_entry(heading)):
                return redirect('edit', editable="Error")
            else:
                util.save_entry(heading, f"# {heading}\n"+new_data)
                return redirect('title', entry=heading)

        else:
            if request.POST.get('q'):
                return routing(request)

    content = util.get_entry(editable)
    if content:
        lines = content.split('\n')
        content = '\n'.join(lines[1:])

    if editable == "Error":
        messages.error(request,'The entered title already exists.')
        content = None
    
    return render(request, "encyclopedia/edit.html", {"data":remove_empty_lines(content), "heading":editable})


def random_page(request):
    return redirect(title, entry=random.choice(util.list_entries()))
    


   

