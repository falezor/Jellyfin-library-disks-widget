# Jellyfin: widget "Dyski bibliotek"

Mały widget na dashboard Jellyfina pokazujący **na jakich dyskach leżą foldery bibliotek**: procent zajęcia, wolne miejsce i rozmiar dysku. Bez pluginu C#, bez kompilowania i bez klucza API: to jeden skrypt dla pluginu JS Injector.

Wbudowana karta **Paths** pokazuje tylko foldery samego Jellyfina (cache, metadane, logi). Ten widget pokazuje dyski, na których leżą Twoje biblioteki.

## Instalacja

1. Dashboard -> **JS Injector** -> dodaj nowy skrypt.
2. Wklej zawartość [`disk-widget.js`](disk-widget.js) i zapisz.
3. Otwórz dashboard i odśwież przez `Ctrl+F5`.

Widget pojawia się na dole dashboardu, na pełną szerokość. Wymaga zalogowania jako administrator oraz endpointu `/System/Info/Storage` z listą `Libraries` (testowane na Jellyfin 12.4). Pełny opis, test endpointu i opcje dostosowania są w [README.md](README.md) (po angielsku).

## Najważniejsze cechy

- Jedna karta na dysk / punkt montowania, z listą bibliotek, które z niego korzystają
- Pasek: zielony do 75%, pomarańczowy 75-90%, czerwony powyżej 90%
- Karty skalują się z oknem przeglądarki
- Działa w jasnym i ciemnym motywie
- Napisy w języku wybranym w Jellyfinie lub przeglądarce (en, pl, de, fr, es, ru, it, nl)
- Nowe foldery bibliotek i zmiany nazw punktów montowania pojawiają się same po odświeżeniu strony

Licencja: MIT.
