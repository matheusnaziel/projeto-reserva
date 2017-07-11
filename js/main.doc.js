// DEFININDO EM QUAL ESCOPO TRABALHAREMOS
var App = {};

// Função Jquery auto executavel
// Nessa função eu apenas instancio classe ( App.Application ) e executo o método run.
$(function(){
  // Passo o document.body para meu constructor da classe, por questões de performance em casos de manipulação do DOM.
  var app = new App.Application(document.body);

  // Execução do método RUN da classe ( App.Application )
  app.run();
});

// CLASSE INIT
App.Application = (function() {

  // CONSTRUCTOR
  function Application(container) {
    // O this.container recebe o document.body
    this.container = $(container);

    // O state são as chaves que utilizaremos para salvar o retorno da requisição
    this.state = {
      mail: null,
      sections: []
    };
  }

  // Essa forma de declaração, no uso do prototype é apenas um design pattern.
  Application.fn = Application.prototype;

  // Método RUN, é o método que EXECUTA quase todos os outros métodos,
  // com exceção do método insertContentSlider que é executado no final do parsing do retorno do Request - Application.fn.sendSequest
  Application.fn.run = function() {
      this.sendSequest('lucasaborges@hotmail.com'); // EXECUÇÃO DO METODO QUE FAZ A REQUISIÇÃO
      this.initSliderCategory(); // EXECUÇÃO DO MÉTODO QUE INICIA O SLIDE COM AS CATEGORIAS
      this.insertContentHero(); // EXECUÇÃO DO MÉTODO QUE FAZ O INSERT DE CONTEUDO NO HERO

      // ESSE MÉTODO SÓ PRECISA SER EXECUTADO CASO A SECTION COM A CLASSE: header-withButton ESTEJA SENDO USADA.
      // this.initClipboard();
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

          // DAQUI ATÉ O FINAL DESSE IF EU FAÇO O PARSING E SEPARO OS DADOS DA MELHOR FORMA PARA MANIPULA-LOS EM OUTRO MÉTODO.
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

            // CONFORME ELE PASSA PELOS MAPS E FILTER ACIMA, EU DO PUSH DO OBJETO "var data = {};" CRIADO NO INICIO DO MAP PARA O STATE DO CONSTRUCTOR,
            // ASSIM EU CONSIGO ACESSAR ESSE ARRAY FORA DESSE MÉTODO.
            _self.state.sections.push(data);

            if (i === 3) {
              // QUANDO O INDICE É IGUAL A 3, EU ENTENDO QUE É O ULTIMO ITEM DO response.recs PARA PERCORRER,
              // ENTÃO NESSE MOMENTO EU EXECUTO A FUNÇÃO insertContentSlider.
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
    // O USO DESSA LIB PODE SER FACILMENTE COMPREENDIDA PELA DOC.
    // https://clipboardjs.com/
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

    // INICIANDO A INSTANCIA DO VUE
    new Vue({
      // CHAVE el:
      // setamos o ID da section onde nos temos as variaveis data binding do VUE {{ mail }}
      // EXEMPLO DA SECTION: <section id="hero" class="mz-section-0 header-2">
      // OUTRO EXEMPLO COM AS VARIAVEIS: <h2 class="mz-text-header">OLÁ<br>{{ mail }}</h2>
      el: '#hero',
      // CHAVE data:
      // Na chave data é onde setamos o dado que vai substituir as variaveis
      data: {
        mail: _self.state.mail
      }
    });
  }

  Application.fn.insertContentSlider = function() {
    var _self = this;

    // A INSTÂNCIA DE INICIO DE CADA SLIDER, E O APONTAMENTO DOS DADOS A SEREM PREENCHIDOS EM CADA UM É IGUAL,
    // PORTANDO EU CRIO ESSE ARRAY QUE VAI INICIAR OS QUATRO SLIDERS EM UM UNICO MÉTODO.
    var loop = [
      "combinar",
      "ultimos",
      "polos",
      "camisetas"
    ];

    // CRIANDO ESCOPO QUE VOU UTILIZAR DENTRO DO MAP
    var filterCombinar = {};

    // FAÇO UM MAP DO ARRAY
    _.map(loop, function(id, index) {
      // A CADA INDEX DO MAP EU FILTRO O CONTEUDO DO SLIDER
      filterCombinar = _.filter(_self.state.sections, function(o) {
        return o.sectionPosition === index
      });

      // INICIO DA INTANCIA DO VUE, NO MÉTODO insertContentHero EU JÁ EXPLIQUEI CADA CHAVE E COMO COMO FUNCIONA
      new Vue({
        el: '#' + id,
        data: {
          section: filterCombinar[0].sectionProducts,
          sectionUrl: filterCombinar[0].sectionUrl,
          sectionTitle: filterCombinar[0].sectionTitle
        }
      });

      // INICIO DA INSTACIA DO SLIDER
      // PERCEBA QUE USO O ID PARA CONCATENAR, QUE REPRESENTA UMA CLASSE NA SECTION DE CADA SLIDER

      // EXEMPLO:
      // .swiper-container--combinar
      // .swiper-container--ultimos
      // .swiper-container--polos
      // .swiper-container--camisetas

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
