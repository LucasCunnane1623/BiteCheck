

//client side like and dislike button handlers so that we don't have to ping the PATCH methods via making a method handling middleware
document.querySelectorAll('.like-button').forEach((button) => {//gather all LIKE buttons 
button.addEventListener('click', async () => {//and attach event listeners to them
    const postId = button.dataset.postId;
    try {
        const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'PATCH',
            headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to like post');
    }

    window.location.reload();
    } catch (error) {
        throw new Error(`${error}: Could not like the post`);
    }
});
});

document.querySelectorAll('.dislike-button').forEach((button) => { //gather ALL dislike buttons and add event listeners to all  
button.addEventListener('click', async () => {
    //https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset 
    const postId = button.dataset.postId; //grabbed the data- value i passed in via handlebars

    try {
    const response = await fetch(`/api/posts/${postId}/dislike`, {
        method: 'PATCH',
        headers: {
        'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to dislike post');
    }

    window.location.reload();
    } catch (error) {
        throw new Error(`${error}: Could not dislike the post`);
    }
});
});
