# ryanize-bib [(online)](https://vilda.net/s/ryanize-bib/)

Ryanize bib file:
- check that URLs are included
- check that important capital letters are protected
- discourage arXiv and publisher usage
- unify format (intendation, brackets, etc)
- bunch of other bib etiquette rules

![image](https://github.com/zouharvi/ryanize-bib/assets/7661193/4c0119e5-a8b9-4e6c-a965-748dea0b90f6)

What's not working:
- nonstandard BibTeX formatting
- anything that you'll find, in which case file an issue here and ideally submit a PR

Try the tool at [vilda.net/s/ryanize-bib/](https://vilda.net/s/ryanize-bib/). This project was named after [Ryan Cotterell](https://rycolab.io/) who scolds his PhD students for not following the basic bib rules. Even though the project does not list coauthors, there are many that provided valuable feedback.

This tool is somewhat more opinionated than [aclpubcheck](https://github.com/acl-org/aclpubcheck), focuses solely on the bib file, and aims to be more accessible (hence web version).

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
