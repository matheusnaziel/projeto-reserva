var App = {};

$(function(){
  var app = new App.Application(document.body);
  app.run();
});

App.Application = (function() {
  function Application(container) {
    this.container = $(container);
    this.state = {
      mail: null,
      sections: []
    };
  }

  Application.fn = Application.prototype;

  Application.fn.run = function() {
      console.log('Running!', this.state);

      this.sendSequest('lucasaborges@hotmail.com');
      this.initSliderCategory();
      this.insertContentHero();

      this.initClipboard();
  };

  Application.fn.sendSequest = function(email) {
    var _self = this;
    this.state.mail = email;
    var RECSYS_URL = 'http://34.207.202.190:3000/recapi/v1/rec/' + email;
    var xhttp = new XMLHttpRequest();

    xhttp.open('GET', RECSYS_URL, true);
    xhttp.send();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200) {
          var response = JSON.parse(xhttp.responseText);

          _.map(response.recs, function(o, i){
            var data = {};

            data.sectionPosition = o.rank;
            data.sectionTitle = o.nome;
            data.sectionUrl = 'https://www.usereserva.com/usereserva/c/masculino/' + o.nome;
            data.sectionProducts = [];

            var filteredIsEstoque = _.filter(o.produtos, function(o) {
              return o.estoque !== 0
            });

            _.map(filteredIsEstoque, function(o, i) {
              var item = {};

              item.productName = o.titulo;
              item.productUrl = 'https://www.usereserva.com/usereserva/p/produto/' + o.produto;

              _.map(o.cores, function(o, i) {
                if (o.estoque !== 0) {
                  item.produtoImage = o.imgUrl;
                  item.productTitle = o.titulo;
                  item.productPrice = o.preco_por;
                  item.productPriceWithOption = o.preco_de;
                  data.sectionProducts.push(item);
                };
              });
            });

            _self.state.sections.push(data);

            if (i === 3) {
              _self.insertContentSlider();
            };
          });
        } else {
          console.log('ERROR: ', this.status);
        }
      };
    };
  };

  Application.fn.initClipboard = function() {
      var clipboard = new Clipboard('.cupom-button');

      clipboard.on('success', function(e) {
          console.info('Action:', e.action);
          console.info('Text:', e.text);
          console.info('Trigger:', e.trigger);

          e.clearSelection();
      });
  };

  Application.fn.initSliderCategory = function() {
      new Swiper('.swiper-container--categorias', {
          slidesPerView: 6,
          paginationClickable: true,
          nextButton: '.mz-bgSlider-next--categorias',
          prevButton: '.mz-bgSlider-prev--categorias',
          loop: true,
          spaceBetween: 30
      });
  };

  Application.fn.insertContentHero = function() {
    var _self = this;

    new Vue({
      el: '#hero',
      data: {
        mail: _self.state.mail
      }
    });
  }

  Application.fn.insertContentSlider = function() {
    var _self = this;

    var loop = [
      "combinar",
      "ultimos",
      "polos",
      "camisetas"
    ];

    var filterCombinar = {};

    _.map(loop, function(id, index) {
      filterCombinar = _.filter(_self.state.sections, function(o) {
        return o.sectionPosition === index
      });

      new Vue({
        el: '#' + id,
        data: {
          section: filterCombinar[0].sectionProducts,
          sectionUrl: filterCombinar[0].sectionUrl,
          sectionTitle: filterCombinar[0].sectionTitle
        }
      });

      new Swiper('.swiper-container--' + id, {
          slidesPerView: 6,
          paginationClickable: true,
          nextButton: '.mz-bgSlider-next--' + id,
          prevButton: '.mz-bgSlider-prev--' + id,
          loop: true,
          spaceBetween: 30
      });
    });
  }
  
  return Application;
})();
