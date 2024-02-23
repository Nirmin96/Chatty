document.addEventListener('DOMContentLoaded', async () => {
  // Fetch the data
const dataList = await getData();
const filteredList = dataList.filter(element => element.length !== 0);

  // UI Post page Elements
const dataContainer = document.getElementById('data-container');
  
  // Create modal element to show the user info
const modal = document.createElement('main');
modal.id = 'userInfoModal';
modal.innerHTML = `
<article>
<button id="closeModal" aria-label="Close">&times;</button>
<p id="modalContent"></p>
</article>
`;
document.body.appendChild(modal);

  // Pagination state to start from the first post
  let currentIndex = 0;

  // Function to render the current post
  const renderPost = (index) => {

    if (index >= filteredList.length) {
      dataContainer.innerHTML = '<h2> Empty states or errors: No data available. Please try again later.</h2>';
      return; // Prevent attempting to render non-existent data
  }
    
      const element = filteredList[index];
      dataContainer.innerHTML = ''; // Clear previous content

      // Create the post section element
      const userElement = document.createElement('article');
      userElement.classList.add('posts-comments-section');
      const commentsId = `comments-${index}`;

      userElement.innerHTML = `
          <h3 class="post-title"> ${element.title}</h3>
          <button id="showUserInfo-${index}" class="showUserInfo-btn"><i class="fa-solid fa-user"></i> User(${element.PostUserInfo[0].id}) ${element.PostUserInfo[0].username}</button>
          <p class="post-body">Post:(${element.postId}) ${element.body}</p>
          <p class="tags-icon"><i class="fa-solid fa-hashtag"> Tags: ${element.tags.join(', ')}</i></p>
          <p class="reactions-icon"><i class="fa-solid fa-heart"> Reactions: ${element.reactions}</i></p>
          <button id="btn-${index}" class="ShowComments-btn">Show Comments</button>
          <section id="${commentsId}" style="display: none;">
              ${element.comments.map(comment => `<p class="comment-users"><i class=" fa-solid fa-user"></i> <b>${comment.username}:</b> ${comment.body}</p>`).join('')}
          </section>
      `;

      // Append the new post
      dataContainer.appendChild(userElement);

      // Add event listeners for the newly created elements
      addPostEventListeners(index, element, commentsId);
  };

  // Add event listeners for modal, user info, and comments toggle
  const addPostEventListeners = (index, element, commentsId) => {
      // Show/Hide Comments
      document.getElementById(`btn-${index}`).addEventListener('click', () => {
          const commentsDiv = document.getElementById(commentsId);
          commentsDiv.style.display = commentsDiv.style.display === "none" ? "block" : "none";
          document.getElementById(`btn-${index}`).innerText = commentsDiv.style.display === "block" ? "Hide Comments" : "Show Comments";
      });

      // Show User Info in Modal
      document.getElementById(`showUserInfo-${index}`).addEventListener('click', () => {
          const userInfo = element.PostUserInfo[0]; // Assuming one user per post
          const modalContent = document.getElementById('modalContent');
          modalContent.innerHTML = `
          <ul>
              <h3 class="first-lastname"><i class="fa-solid fa-user"></i> ${userInfo.firstName} ${userInfo.lastName}</h3>
              <li><i class="fa-solid fa-phone"></i> ${userInfo.phone}</li>
              <li><i class="fa-solid fa-envelope"></i> ${userInfo.email}</li>
              <li><img src="${userInfo.image}"></li>
          </ul>
          `;
          modal.style.display = 'block';
      });

      // Close Modal (X)
      document.getElementById('closeModal').addEventListener('click', () => {
          modal.style.display = 'none';
      });
  };

  // Pagination controls
const postButtons = document.createElement('section');
postButtons.className = 'post-buttons';

const nextButton = document.createElement('button');
nextButton.innerText = 'Next Post >>';
nextButton.className = 'next-post';

const prevButton = document.createElement('button');
prevButton.innerText = '<< Previous Post';
prevButton.className = 'prev-post';

// Append buttons to the postButtons section
postButtons.appendChild(prevButton);
postButtons.appendChild(nextButton);

// Insert the postButtons section after the dataContainer element
dataContainer.after(postButtons);


  nextButton.addEventListener('click', () => {
      if (currentIndex < filteredList.length - 1) {
          currentIndex++;
          renderPost(currentIndex);
      }
  });

  prevButton.addEventListener('click', () => {
      if (currentIndex > 0) {
          currentIndex--;
          renderPost(currentIndex);
      }
  });

  // Initial post rendering function
  renderPost(currentIndex);
});


async function getData() {
  let list = [];
  
  try {
    const responses = await Promise.all([
      fetch('https://dummyjson.com/users?limit=100'),
      fetch('https://dummyjson.com/posts?limit=150'),
      fetch('https://dummyjson.com/comments?limit=340'),
    ]);

    // Check if any of the responses is not OK
    responses.forEach(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    });

    // If all responses are OK, proceed to process them
    const users = await responses[0].json();
    const posts = await responses[1].json();
    const comments = await responses[2].json();
    
    posts.posts.forEach(post => {
      list.push(createPostWithComments(post.id, post.title, post.body, post.tags, post.reactions, comments.comments.filter(comment => comment.postId === post.id), users.users.filter(user => user.id === post.userId)));
    });
  } catch (error) {
    console.error('Failed to fetch data or build HTML:', error);
    
  }
  return list;
}

// creat the post and commnets and the users obj
function createPostWithComments(postId, title, body, tags, reactions, comments, users) {
  //creat the post obj and the comments-users lists
  let newUser = {
      "postId": postId,
      "title": title,
      "body": body,
      "tags": tags,
      "reactions": reactions,
      "comments": [],
      "PostUserInfo": []
  };

  //loop to creat the comment obj and push it to comments list
  comments.forEach(comment => {
      newUser.comments.push({
        "username": comment.user.username,
        "id": comment.id,  
        "body": comment.body
      });
  });

  // loop to creat the user obj and push to the postuserinfo list
  users.forEach(user => {
      newUser.PostUserInfo.push({
        "id": user.id,
        "username": user.username,
        "firstName": user.firstName,
        "lastName": user.lastName, 
        "age": user.age,
        "email": user.email,
        "phone": user.phone,
        "image": user.image
      });
  });

  return newUser;
}

// contact form
const contactForm = document.getElementById('contactForm');
const contactErrorMessages = document.getElementById('contactErrorMessages');
const contactEmail = document.getElementById('email');
const contactIssue = document.getElementById('issue');

contactForm.addEventListener('submit', function(event) {
    event.preventDefault();
    contactErrorMessages.innerHTML = '';
    validateContactForm();
});

function validateContactForm() {
    let valid = true;
    let messages = [];

    if (contactEmail.value === '' || !contactEmail.value.includes('@')) {
        messages.push('Please enter a valid email.');
        valid = false;
    }

    if (contactIssue.value === '') {
        messages.push('Please describe your issue.');
        valid = false;
    }

    if (!valid) {
        contactErrorMessages.innerHTML = messages.join('<br>');
    } else {
        // Submit the form data if valid
        contactForm.submit();
    }
}