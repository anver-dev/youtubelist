const btnSearch = $("#btnSearch");
const divBtn = $("#divBtn");
const videoPlayer = $("#videoFrame");
const divNotVideoSelected = $("#not-video");
const cards = $("#cards");
const divEmptyInputAlert = $(".id-empty");
const inputPlaylistId = $("#idPlaylist");
const divError = $("#IDNotFound");

// themes configuration variables
const body = document.querySelector("body");
const nav = document.querySelector("nav");
const aColor = document.querySelectorAll(".color-theme");
const aTheme = document.querySelectorAll(".theme-bg");

var widthImage = 120;
var heightImage = 90;

// themes configuration
if (localStorage.getItem("theme-color")) {
  const themeColor = localStorage.getItem("theme-color");
  body.classList.add(`theme-${themeColor}`);
}

if (localStorage.getItem("theme")) {
  const theme = localStorage.getItem("theme");
  nav.className = "navbar navbar-expand-lg";
  nav.classList.add(`navbar-${theme}`);
  nav.classList.add(`bg-${theme}`);
  if ($("body").hasClass("theme-dark")) $("body").removeClass("theme-dark");
  else $("body").removeClass("theme-light");
  body.classList.add(`theme-${theme}`);
}

aColor.forEach((aItem) => {
  aItem.addEventListener("click", (e) => {
    let color = aItem.getAttribute("data-themecolor");
    if ($("body").hasClass("theme-dark")) body.className = "theme-dark";
    else body.className = "theme-light";
    body.classList.add(`theme-${color}`);
    localStorage.setItem("theme-color", color);
  });
});

aTheme.forEach((aItem) => {
  aItem.addEventListener("click", (e) => {
    let themeColor = aItem.getAttribute("data-theme");
    console.log("color: " + themeColor);
    nav.className = "navbar navbar-expand-lg";
    nav.classList.add(`navbar-${themeColor}`);
    nav.classList.add(`bg-${themeColor}`);
    if ($("body").hasClass("theme-dark")) $("body").removeClass("theme-dark");
    else $("body").removeClass("theme-light");
    body.classList.add(`theme-${themeColor}`);
    localStorage.setItem("theme", themeColor);
  });
});

// btn resize
$(window).on("load resize", function () {
  if (this.matchMedia("(min-width: 768px)").matches) {
    divBtn.removeClass("d-grid gap-2");
  } else {
    divBtn.addClass("d-grid gap-2");
    widthImage = 50;
    heightImage = 50;
  }
});

cards.hide();
divEmptyInputAlert.hide();
divError.hide();

$(document).ready(function () {
  // URL del API de youtube
  var URL = "https://content.googleapis.com/youtube/v3/playlistItems";
  var URLPlaylist = "https://www.googleapis.com/youtube/v3/playlists";

  // Llave obtenida de google
  var APIKey = "AIzaSyBEwxbWCszsTN3RrvTZh8Rvgm4POopgT1Y";

  btnSearch.click(function () {
    var playlistID = inputPlaylistId.val();

    if (playlistID == "") {
      divEmptyInputAlert.show(600);
      cards.hide(400);
      divError.hide(600);
    } else {
      divEmptyInputAlert.hide(600);
      // Invocación AJAX
      $.get(
        URL,
        "playlistId=" +
          playlistID +
          "&maxResults=50&part=id,snippet&key=" +
          APIKey,
        function (data) {
          console.log(`datos de respuesta: ${data}`);
        }
      )
        .done(function (data, textStatus, xhr) {
          cargaPlaylist(data);
        })
        .fail(function (data, textStatus, xhr) {
          console.log("error", data.status);
          console.log("STATUS: " + xhr);
          errorPlaylist();
        })
        .always(function () {
          //TO-DO after fail/done request.
          console.log("ended");
        });

      // Callback. Playlist es un objeto que contiene otros objetos que son las entradas de la lista
      function cargaPlaylist(playlist) {
        $("#titlePlaylist").empty();
        $("#descriptionPlaylist").empty();
        $("#contenido").empty();
        videoPlayer.hide();
        divError.hide(600);
        divNotVideoSelected.show();

        console.log(JSON.stringify(playlist.items[0].snippet));
        // Este mensaje aparece en la consola de desarrollo de JavaScript en el navegador
        console.log(
          "Encontré lista con " + playlist.items.length + " elementos"
        );

        $.get(
          URLPlaylist,
          { part: "snippet", id: playlistID, key: APIKey },
          cargaDatosPlaylist
        );

        // Recorre los objetos de la playlist y genera la lista
        for (let i = 0; i < playlist.items.length; i++) {
          var element = playlist.items[i];
          console.log(element);
          if (element.snippet.title != "Deleted video") {
            $("#contenido").append(
              $(`<li class='list-group-item' onclick="playVideo('${element.snippet.resourceId.videoId}')">
                <a>
                  <div class="row box align-items-center">
                    <div class="col-md-4 col-xs-4 col-5 p-0">
                      <img src="${element.snippet.thumbnails.default.url}" width=${widthImage} height=${heightImage}>
                    </div>
                    <div class="col-md-8 col-xs-8 col-7 pe-1 ">
                      <blockquote class="blockquote">
                        ${element.snippet.title}
                      </blockquote>
                      <figcaption class="blockquote-footer">
                        ${element.snippet.videoOwnerChannelTitle}
                      </figcaption>
                    </div>
                  </div>
                </a>          
            </li>`)
            );
          }
        }
        cards.show(400);
      }

      function errorPlaylist() {
        divError.show(600);
        divEmptyInputAlert.hide(600);
        cards.hide(600);
      }

      inputPlaylistId.val("");
    }
  });

  function cargaDatosPlaylist(playlist) {
    //console.log(playlist.items[0].snippet.localized.title);
    var title = playlist.items[0].snippet.localized.title;
    var description = playlist.items[0].snippet.localized.description;
    $("#titlePlaylist").append(title);
    //$("#descriptionPlaylist").append(description);
  }
});

function playVideo(videoId) {
  divNotVideoSelected.hide();
  console.log(videoId);
  srcVideo = `https://www.youtube.com/embed/${videoId}`;
  videoPlayer.attr("src", srcVideo);
  videoPlayer.show(1000);
}
