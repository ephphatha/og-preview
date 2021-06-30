function displayPreview(event) {
  const leftPosition = event.currentTarget.getBoundingClientRect().left;

  chrome.runtime.sendMessage({url: event.currentTarget.nextSibling.href, id: event.currentTarget.id}, (response) => {
    const previewPopup = document.createElement('div');
    previewPopup.id = 'e-og-overlay';
    previewPopup.classList.add('bbc-block');
    previewPopup.style = `position: absolute; max-width: 50%; left: ${leftPosition}px`;
    previewPopup.addEventListener('click', () => previewPopup.remove());

    if (response.properties.title) {
      const title = document.createElement('h3');
      title.innerText = response.properties.title;
      previewPopup.appendChild(title);
    }

    if (response.properties.description) {
      const description = document.createElement('p');
      description.innerText = response.properties.description;
      previewPopup.appendChild(description);
    }

    if (response.properties.image) {
      const articleImage = document.createElement('img');
      articleImage.src = response.properties.image;
      previewPopup.appendChild(articleImage);
    }

    if (previewPopup.childElementCount == 0) {
      previewPopup.innerText = "No metadata recognised."
    }

    const existingOverlay = document.querySelector(`#${previewPopup.id}`);
    if (existingOverlay) {
      existingOverlay.remove();
    }
    document.querySelector(`#${response.id}`).after(previewPopup);
  });
}

function doInit() {
  let buttonId = 0;
  for (const postBodyLink of document.querySelectorAll('.postbody > a')) {
    const showPreviewButton = document.createElement('button');
    showPreviewButton.id = `e-og-${buttonId++}`;
    showPreviewButton.innerText = 'OG';
    showPreviewButton.addEventListener('click', displayPreview);
    postBodyLink.before(showPreviewButton);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', doInit);
} else {
  doInit();
}