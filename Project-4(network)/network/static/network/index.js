window.addEventListener("DOMContentLoaded", () => {
    var editButtons = document.getElementsByClassName('edit-button');
    var saveButtons = document.getElementsByClassName('save-button');
    var likeButtons = document.getElementsByClassName('like-button');

    for (var i = 0; i < editButtons.length; i++) {
        editButtons[i].addEventListener('click', handleEditButtonClick);
        saveButtons[i].addEventListener('click', handleSaveButtonClick);
    }
    for (var i = 0; i < likeButtons.length; i++) {
        likeButtons[i].addEventListener('click', handleLikeButtonClick);
    }
  });


  function handleEditButtonClick(event) {
    var postId = event.target.getAttribute('data-post-id');
    var postContentElement = document.getElementById('post-content-' + postId);
    var postContent = postContentElement.innerHTML;
    postContentElement.style.display = "None";
  
    var textarea = document.getElementById('post-content-textarea-'+postId)
    textarea.style.display = "block";

    textarea.value = postContent;

    var editButton = document.getElementById('post-content-edit-button-'+postId)
    var saveButton = document.getElementById('post-content-save-button-'+postId)

    editButton.style.display = "None";
    saveButton.style.display = "block";
  }

 function handleSaveButtonClick(event){
    var postId = event.target.getAttribute('data-post-id');
    var postContentElement = document.getElementById('post-content-' + postId);
    postContentElement.style.display = "block";
  
    var textarea = document.getElementById('post-content-textarea-'+postId)
    textarea.style.display = "None";
  
    postContentElement.innerHTML = textarea.value;

    var editButton = document.getElementById('post-content-edit-button-'+postId)
    var saveButton = document.getElementById('post-content-save-button-'+postId)

    editButton.style.display = "block";
    saveButton.style.display = "None";

    // var csrftoken = Cookies.get('csrftoken');
    fetch('/edit_post', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id:postId,
            text:textarea.value
        })
    });

}

function handleLikeButtonClick(event){
    var postId = event.target.getAttribute('data-post-id');
    var likeButton = document.getElementById('post-content-like-button-'+postId);
    var likeCount = document.getElementById('post-content-like-count-'+postId);

    // var intval = int(likeCount);
    if (likeButton.style.color === "red") {
        likeButton.style.color = "grey";
        likeCount.innerHTML = parseInt(likeCount.innerHTML)-1;

        fetch('/edit_post', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                like:false,
                id:postId
            })
        });

    } else {
        likeButton.style.color = "red";
        likeCount.innerHTML = parseInt(likeCount.innerHTML)+1;

        fetch('/edit_post', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                like:true,
                id:postId
            })
        });
    };
}
