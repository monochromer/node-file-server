;(function () {
  const fileInput = document.querySelector('input[type="file"]');
  const dragArea = document.body;

  function uploadFile(file, url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.onload = xhr.onerror = function(event) {
      if (xhr.status >= 400) {
        callback(event);
      } else {
        callback(null);
      }
    };
    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        console.log('upload progress', e.loaded, e.total)
      }
    }
    xhr.send(file);
  }

  function onFileUpload(errorEvent) {
    if (errorEvent) {
      alert(`error: ${errorEvent.target.responseText}`);
    } else {
      window.location = window.location;
    }
  }

  function getFileUploadURL(file) {
    const baseUrl = window.location.pathname === '/'
      ? ''
      : window.location.pathname;
    return `${baseUrl}/${file.name}`;
  }

  fileInput.onchange = function(event) {
    const file = event.target.files[0];
    uploadFile(file, getFileUploadURL(file), onFileUpload);
  }

  dragArea.addEventListener('dragenter', function(event) {
    dragArea.setAttribute('data-drag', 'enter');
  });

  dragArea.addEventListener('dragleave',function(event) {
    if (event.relatedTarget !== null) return;
    dragArea.setAttribute('data-drag', 'leave');
    dragArea.classList.remove('drag-active');
  });

  dragArea.addEventListener('dragover', function(event) {
    event.preventDefault();
    if (event.dataTransfer.types.indexOf('Files') !== -1) {
      dragArea.classList.add('drag-active');
    }
  });

  dragArea.addEventListener('drop', function(event) {
    event.preventDefault();
    dragArea.setAttribute('data-drag', 'drop');
    dragArea.classList.remove('drag-active');
    const file = event.dataTransfer.files[0];
    uploadFile(file, getFileUploadURL(file), onFileUpload);
  })
})();

;(function() {
  document.addEventListener('click', function(event) {
    const button = event.target.closest('[name="delete"]');
    if (!button) return;
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', button.value);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.onload = xhr.onerror = function() {
      if (xhr.status >= 400) {
        console.error(xhr.status, xhr.responseText);
      } else {
        window.location = window.location;
      }
    };
    xhr.send();
  })
})()