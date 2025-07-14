document.addEventListener("DOMContentLoaded", function () {
  var searchInput = document.getElementById("searchInput");
  var searchButton = document.getElementById("searchButton");

  var xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open(
    "GET",
    "https://demoapi.shortfundly.com/film/trending/all?page=1&limit=10",
    true
  );

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var json = JSON.parse(xhr.responseText);
      var videos = json.docs || json.videos || json;

      if (!Array.isArray(videos)) {
        console.error("API response format invalid.");
        return;
      }

      window.allVideos = videos;

      searchButton.addEventListener("click", function () {
        performSearch(videos);
      });

      searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter" || e.keyCode === 13) {
          performSearch(videos);
        }
      });
    } else if (xhr.readyState === 4) {
      console.error("Failed to load videos:", xhr.status);
    }
  };

  xhr.send();
});

function performSearch(videos) {
  var query = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!query) {
    alert("Please enter a search term.");
    return;
  }

  var filtered = videos.filter(function (video) {
    var fields = [];

    if (video.title) {
      fields = fields.concat(video.title.toLowerCase().split(/\s+/));
    }
    if (video.tags) {
      fields = fields.concat(video.tags.toLowerCase().split(/\s+/));
    }
    if (video.category && video.category.name) {
      fields = fields.concat(video.category.name.toLowerCase().split(/\s+/));
    }
    if (video.description) {
      fields = fields.concat(video.description.toLowerCase().split(/\s+/));
    }

    return fields.some(function (word) {
      return word.startsWith(query);
    });
  });

  if (filtered.length === 0) {
    alert("No videos found.");
    return;
  }

  buildThumbnails("results-container", filtered); // ✅ fixed target id
}

function buildThumbnails(containerId, videoList) {
	  var container = document.getElementById(containerId);
	  if (!container) return;
	  container.innerHTML = "";

	  videoList.forEach(function (video) {
	    var thumb = document.createElement("div");
	    thumb.className = "thumbnail";
	    thumb.tabIndex = 0;

	    var img = document.createElement("img");
	    img.src = video.thumb || video.poster || "images/default.png";
	    img.alt = video.title || "Short Film";

	    var title = document.createElement("div");
	    title.className = "thumbnail-title";
	    title.textContent = video.title || "Untitled";

	    thumb.appendChild(img);
	    thumb.appendChild(title);

	    // ✅ Add click to navigate to detail.html
	    thumb.addEventListener("click", function () {
	      sessionStorage.setItem("selectedVideo", JSON.stringify(video));
	      window.location.href = "detail.html";
	    });

	    // ✅ Support Enter key for keyboard/remote
	    thumb.addEventListener("keydown", function (e) {
	      if (e.key === "Enter" || e.keyCode === 13) {
	        sessionStorage.setItem("selectedVideo", JSON.stringify(video));
	        window.location.href = "detail.html";
	      }
	    });

	    container.appendChild(thumb);
	  });
	}
