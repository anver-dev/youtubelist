// Elementos DOM
const btnSearch = $("#btnSearch");
const divBtn = $("#divBtn");
const videoPlayer = $("#videoFrame");
const divNotVideoSelected = $("#not-video");
const cards = $("#cards");
const divEmptyInputAlert = $(".id-empty");
const inputPlaylistId = $("#idPlaylist");
const divError = $("#IDNotFound");
const tituloPlaylist = $("#titlePlaylist");
const titutloPlaylistModal = $("#titlePlaylistModal");
const descripcionPlaylist = $("#descriptionPlaylist");
const creadorPlaylist = $("#creadorPlaylist");
const fechaPlaylist = $("#fechaPlaylist");
const divContenido = $("#contenido");

// variables de confiuracion para temas
const body = document.querySelector("body");
const nav = document.querySelector("nav");
const footer = document.querySelector("footer");
const aColor = document.querySelectorAll(".color-theme");
const aTheme = document.querySelectorAll(".theme-bg");

// variables para tamaño de miniaturas
var widthImage = 120;
var heightImage = 90;

// Ajuste responsivo de botón
$(window).on("load resize", function () {
  if (this.matchMedia("(min-width: 768px)").matches) {
    divBtn.removeClass("d-grid gap-2");
  } else {
    divBtn.addClass("d-grid gap-2");
    widthImage = 50;
    heightImage = 50;
  }
});

// Ocultamos contenedores de video, error y alertas
cards.hide();
divEmptyInputAlert.hide();
divError.hide();

$(document).ready(function () {
  // Checamos si hay variable local del color
  if (localStorage.getItem("theme-color")) {
    const themeColor = localStorage.getItem("theme-color");
    body.classList.add(`theme-${themeColor}`);
  }

  // Checamos si hay variable local del tema global
  if (localStorage.getItem("theme")) {
    const theme = localStorage.getItem("theme");
    nav.className = "navbar navbar-expand-lg";
    nav.classList.add(`navbar-${theme}`);
    nav.classList.add(`bg-${theme}`);
    validarBody();
    validarFooter();
    body.classList.add(`theme-${theme}`);
    footer.classList.add(`bg-${theme}`);
  }

  // Configuracion para el color
  aColor.forEach((aItem) => {
    aItem.addEventListener("click", (e) => {
      let color = aItem.getAttribute("data-themecolor");
      if ($("body").hasClass("theme-dark")) body.className = "theme-dark";
      else body.className = "theme-light";
      body.classList.add(`theme-${color}`);
      localStorage.setItem("theme-color", color);
    });
  });

  // Configuracion para el tema global
  aTheme.forEach((aItem) => {
    aItem.addEventListener("click", (e) => {
      let themeColor = aItem.getAttribute("data-theme");
      nav.className = "navbar navbar-expand-lg";
      nav.classList.add(`navbar-${themeColor}`);
      nav.classList.add(`bg-${themeColor}`);

      validarBody();
      validarFooter();

      body.classList.add(`theme-${themeColor}`);
      footer.classList.add(`bg-${themeColor}`);

      localStorage.setItem("theme", themeColor);
    });
  });

  // Validamos la clase de body para cambiar tema global
  function validarBody() {
    if ($("body").hasClass("theme-dark")) $("body").removeClass("theme-dark");
    else $("body").removeClass("theme-light");
  }

  // Validamos clase de footer para cambiar tema global
  function validarFooter() {
    if ($("footer").hasClass("bg-dark")) $("footer").removeClass("bg-dark");
    else $("footer").removeClass("bg-light");
  }
  
  // URL del API de youtube
  var URL = "https://content.googleapis.com/youtube/v3/playlistItems";
  var URLPlaylist = "https://www.googleapis.com/youtube/v3/playlists";

  // Llave obtenida de google
  var APIKey = "";

  // Funcion para evento click en boton buscar
  btnSearch.click(function () {
    var playlistID = inputPlaylistId.val();

    // verificamos si se intenta enviar ID vacio
    if (playlistID == "") {
      divEmptyInputAlert.show(600);
      cards.hide(600);
      divError.hide(600);
    } else {
      // Ocultamos mensajes de alerta si hay
      divEmptyInputAlert.hide(600);

      // Invocación AJAX 
      $.get(
        URL,
        "playlistId=" +
          playlistID +
          "&maxResults=50&part=id,snippet&key=" +
          APIKey,
        function (data) {
          // Vemos respuesta de invocacion
          console.log(`datos de respuesta: ${data}`);
        }
      )
        // Si la peticion responde correctamente cargamos la playlist
        .done(function (data, textStatus, xhr) {
          cargaPlaylist(data);
        })
        // Si la peticion arroja un error 404 ejecutamos la funcion de error
        .fail(function (data, textStatus, xhr) {
          console.log("error", data.status);
          console.log("STATUS: " + xhr);
          if(data.status == 404) {
            errorPlaylist();
          }
        });

      // Funcion callback de éxito
      function cargaPlaylist(playlist) {
        // Vaciamos los contenedores en caso de haber sido llenados previamente
        tituloPlaylist.empty();
        descripcionPlaylist.empty();
        titutloPlaylistModal.empty();
        creadorPlaylist.empty();
        fechaPlaylist.empty();
        divContenido.empty();
        videoPlayer.hide();
        divError.hide(600);
        divNotVideoSelected.show();

        // Hacemos una segunda invocacion AJAX para obtener los datos de la playlist, como descripcion, creador y fecha de creación.
        $.get(
          URLPlaylist,
          { part: "snippet", id: playlistID, key: APIKey },
          cargaDatosPlaylist
        );

        // Empezamos a reproducir el primer video
        playVideo(`${playlist.items[0].snippet.resourceId.videoId}`);

        // Recorre los objetos de la playlist y genera la lista
        for (let i = 0; i < playlist.items.length; i++) {
          var element = playlist.items[i];
          console.log(element);
          if (element.snippet.title != "Deleted video") {
            divContenido.append(
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
        // Mostramos los contenedores para la playlist
        cards.show(600);

        // Eliminamos el valor del campo ID
        inputPlaylistId.val("");
      }

      // Funcion callback de error
      function errorPlaylist() {
        divError.show(600);
        divEmptyInputAlert.hide(600);
        cards.hide(600);
      }
    }
  });

  // Funcion para cargar los datos de la playlist
  function cargaDatosPlaylist(playlist) {
    console.log(playlist.items[0]);
    var title = playlist.items[0].snippet.title;
    var description = playlist.items[0].snippet.description;
    var fecha = playlist.items[0].snippet.publishedAt;
    var creador = playlist.items[0].snippet.channelTitle;
    tituloPlaylist.append(title);
    titutloPlaylistModal.append(title);
    descripcionPlaylist.append(description);
    creadorPlaylist.append(creador);
    fechaPlaylist.append(fecha);
  }
});

// Funcion para mostrar video en el iframe
function playVideo(videoId) {
  divNotVideoSelected.hide();
  console.log(videoId);
  srcVideo = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  videoPlayer.attr("src", srcVideo);
  videoPlayer.show(1000);
}
