# ryanize-bib

Ryanize bib file:
- check that URLs are included
- check that important capital letters are protected
- discourage arXiv and publisher usage
- bunch of other bib etiquette rules

Try it at [vilda.net/s/ryanize-bib/](https://vilda.net/s/ryanize-bib/).

What's not working:
- even slightly nonstandard BibTeX formatting
- anything that you'll find, in which case file an issue here and ideally submit a PR


## Running locally

To run locally, install `npm` and run the following commands:
```
cd src
npm install
npm run dev
```

A window in your browser should open with live changes to code in `src/src`

## TODO

- fix, modularize & prettify code
- unit tests
- middle initials
