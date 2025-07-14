document.addEventListener("DOMContentLoaded", function () {
  var currentPage = 1;
  var limitPerPage = 50;
  var totalPages = 1;

  var prevPageButton = document.getElementById("prevPage");
  var nextPageButton = document.getElementById("nextPage");

  function loadPage(page) {
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open(
      "GET",
      "https://demoapi.shortfundly.com/film/trending/all?page=" + page + "&limit=" + limitPerPage,
      true
    );

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        var videos = json.docs || json.videos || json;

        if (!Array.isArray(videos)) {
          console.error("API response format invalid: expected array.");
          return;
        }

        totalPages = json.totalPages || 10;

        var trending = videos.slice(0, 20);
        var love = videos.filter(function (v) { return matchCategory(v, "romance"); });
        var action = videos.filter(function (v) { return matchCategory(v, "action"); });
        var drama = videos.filter(function (v) { return matchCategory(v, "drama"); });

        buildPaginatedThumbnails("video-container", "trending-pagination", trending, 5);
        buildPaginatedThumbnails("love-container", "love-pagination", love, 5);
        buildPaginatedThumbnails("action-container", "action-pagination", action, 5);
        buildPaginatedThumbnails("drama-container", "drama-pagination", drama, 5);

        var allThumbs = document.querySelectorAll(".thumbnail");
        if (allThumbs.length) {
          allThumbs[0].focus();
        }
      } else if (xhr.readyState === 4) {
        console.error("Failed to load data:", xhr.status);
      }
    };

    xhr.send();
  }

  // Initial load
  loadPage(currentPage);

  // Top-level page navigation
  if (prevPageButton) {
    prevPageButton.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        loadPage(currentPage);
      }
    });
  }

  if (nextPageButton) {
    nextPageButton.addEventListener("click", function () {
      currentPage++;
      loadPage(currentPage);
    });
  }
});

// Helper: check if video matches category
function matchCategory(video, keyword) {
  if (video.category && video.category.name) {
    return video.category.name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
  }
  if (video.tags) {
    return video.tags.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
  }
  return false;
}

// Builds a paginated grid for a section
function buildPaginatedThumbnails(containerId, paginationId, videoList, pageSize) {
  var currentPage = 0;
  var totalPages = Math.ceil(videoList.length / pageSize);
  var container = document.getElementById(containerId);
  var pagination = document.getElementById(paginationId);

  function renderPage() {
    container.innerHTML = "";

    var start = currentPage * pageSize;
    var end = start + pageSize;
    var pageItems = videoList.slice(start, end);

    for (var i = 0; i < pageItems.length; i++) {
      var video = pageItems[i];

      var thumb = document.createElement("div");
      thumb.className = "thumbnail";
      thumb.tabIndex = 0;

      var img = document.createElement("img");
      img.src = video.thumb || video.poster || video.v_poster || "images/default.png";
      img.alt = video.title || "Short Film";

      var title = document.createElement("div");
      title.className = "thumbnail-title";
      title.textContent = video.title || "Untitled";

      thumb.appendChild(img);
      thumb.appendChild(title);

      (function (v) {
        thumb.addEventListener("click", function () {
          sessionStorage.setItem("selectedVideo", JSON.stringify(v));
          window.location.href = "detail.html";
        });
        thumb.addEventListener("keydown", function (e) {
          if (e.keyCode === 13) {
            sessionStorage.setItem("selectedVideo", JSON.stringify(v));
            window.location.href = "detail.html";
          }
        });
      })(video);

      container.appendChild(thumb);
    }

    var html = "";
    html += '<button ' + (currentPage === 0 ? "disabled" : "") + ' id="' + paginationId + '-prev">Prev</button>';
    html += '<span> Page ' + (currentPage + 1) + ' of ' + totalPages + ' </span>';
    html += '<button ' + (currentPage >= totalPages - 1 ? "disabled" : "") + ' id="' + paginationId + '-next">Next</button>';

    if (pagination) {
      pagination.innerHTML = html;

      var prevBtn = document.getElementById(paginationId + "-prev");
      var nextBtn = document.getElementById(paginationId + "-next");

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          if (currentPage > 0) {
            currentPage--;
            renderPage();
          }
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          if (currentPage < totalPages - 1) {
            currentPage++;
            renderPage();
          }
        });
      }
    }
  }

  renderPage();
}

// Global Arrow Key Navigation
document.addEventListener("keydown", function (e) {
  var focused = document.activeElement;
  if (focused && focused.classList.contains("thumbnail")) {
    var allThumbs = Array.prototype.slice.call(document.querySelectorAll(".thumbnail"));
    var index = allThumbs.indexOf(focused);

    if (e.key === "ArrowRight" && allThumbs[index + 1]) {
      allThumbs[index + 1].focus();
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && allThumbs[index - 1]) {
      allThumbs[index - 1].focus();
      e.preventDefault();
    }
    if (e.key === "ArrowDown" && allThumbs[index + 5]) {
      allThumbs[index + 5].focus();
      e.preventDefault();
    }
    if (e.key === "ArrowUp" && allThumbs[index - 5]) {
      allThumbs[index - 5].focus();
      e.preventDefault();
    }
  }
});
