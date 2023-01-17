import { DEVMODE } from "./globals"
export var UID: string
import { setup_navigation } from "./worker_website"

setup_navigation()

const DEFAULT_TEXT = `  
@article{kudo2018subword,
  title={Subword regularization: {I}mproving neural network translation models with multiple subword candidates},
  author={Kudo, Taku},
  journal={arXiv preprint arXiv:1804.10959},
  year={2018}
}

  
  @book{bell1990text,
    title={Text compression},
    author={Bell, Timothy C and Cleary, John G and Witten, Ian H},
    year={1990},
    publisher={Prentice-Hall, Inc.}
  }
  
  @article{campbell1965coding,
      title={A coding theorem and R{\\'e}nyi's entropy},
      author={Campbell, L Lorne},
      journal={Information and control},
      volume={8},
      number={4},
      pages={423--429},
      year={1965},
      publisher={Elsevier}
      url={https://www.sciencedirect.com/science/article/pii/S0019995865903323}
  }
  
  
  @inproceedings{galle2019investigating,
    title = "Investigating the Effectiveness of BPE: The Power of Shorter Sequences",
    author = {Gall{\\'e}, Matthias},
    booktitle = "Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP)",
    month = nov,
    year = "2019",
    address = "Hong Kong, China",
    publisher = "Association for Computational Linguistics",
    url = "https://aclanthology.org/D19-1141",
    doi = "10.18653/v1/D19-1141",
    pages = "1375--1381",
}
`

$("#main_editable").html(DEFAULT_TEXT)

// prevent rich style pasting
document.querySelector("#main_editable").addEventListener("paste", function(e) {
    e.preventDefault();
    var text = (e as any).clipboardData.getData("text/plain");

    document.execCommand("insertText", false, text);
});