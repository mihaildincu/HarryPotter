const CACHE = 'hp-spells-v15';
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/app.js",
  "./js/spells.js",
  "./js/chars.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png",
  "./icons/icon-192-maskable.png",
  "./icons/icon-512-maskable.png",
  "./images/accio.svg",
  "./images/aguamenti.svg",
  "./images/alohomora.svg",
  "./images/anapneo.svg",
  "./images/aparecium.svg",
  "./images/avada-kedavra.svg",
  "./images/avis.svg",
  "./images/confringo.svg",
  "./images/confundo.svg",
  "./images/crucio.svg",
  "./images/defodio.svg",
  "./images/deletrius.svg",
  "./images/densaugeo.svg",
  "./images/deprimo.svg",
  "./images/descendo.svg",
  "./images/diffindo.svg",
  "./images/duro.svg",
  "./images/episkey.svg",
  "./images/erecto.svg",
  "./images/evanesco.svg",
  "./images/expecto-patronum.svg",
  "./images/expelliarmus.svg",
  "./images/expulso.svg",
  "./images/ferula.svg",
  "./images/fidelius.svg",
  "./images/fiendfyre.svg",
  "./images/finite-incantatem.svg",
  "./images/geminio.svg",
  "./images/glisseo.svg",
  "./images/homenum-revelio.svg",
  "./images/impedimenta.svg",
  "./images/imperio.svg",
  "./images/impervius.svg",
  "./images/incarcerous.svg",
  "./images/incendio.svg",
  "./images/legilimens.svg",
  "./images/levicorpus.svg",
  "./images/liberacorpus.svg",
  "./images/locomotor-mortis.svg",
  "./images/lumos.svg",
  "./images/meteolojinx-recanto.svg",
  "./images/mobilicorpus.svg",
  "./images/morsmordre.svg",
  "./images/muffliato.svg",
  "./images/nox.svg",
  "./images/obliviate.svg",
  "./images/obscuro.svg",
  "./images/orchideous.svg",
  "./images/pack.svg",
  "./images/petrificus-totalus.svg",
  "./images/piertotum-locomotor.svg",
  "./images/portus.svg",
  "./images/prior-incantato.svg",
  "./images/protego-totalum.svg",
  "./images/protego.svg",
  "./images/quietus.svg",
  "./images/reducio.svg",
  "./images/reducto.svg",
  "./images/relashio.svg",
  "./images/reparo.svg",
  "./images/repello-muggletum.svg",
  "./images/rictusempra.svg",
  "./images/riddikulus.svg",
  "./images/scourgify.svg",
  "./images/sectumsempra.svg",
  "./images/silencio.svg",
  "./images/sonorus.svg",
  "./images/specialis-revelio.svg",
  "./images/stupefy.svg",
  "./images/tarantallegra.svg",
  "./images/tergeo.svg",
  "./images/wingardium-leviosa.svg",
  "./images/chars/bellatrix.svg",
  "./images/chars/dobby.svg",
  "./images/chars/draco.svg",
  "./images/chars/dumbledore.svg",
  "./images/chars/flitwick.svg",
  "./images/chars/ginny.svg",
  "./images/chars/hagrid.svg",
  "./images/chars/harry.svg",
  "./images/chars/hermione.svg",
  "./images/chars/lockhart.svg",
  "./images/chars/luna.svg",
  "./images/chars/lupin.svg",
  "./images/chars/mcgonagall.svg",
  "./images/chars/molly.svg",
  "./images/chars/neville.svg",
  "./images/chars/ron.svg",
  "./images/chars/sirius.svg",
  "./images/chars/snape.svg",
  "./images/chars/sprout.svg",
  "./images/chars/voldemort.svg"
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((cached) => {
      const net = fetch(e.request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
