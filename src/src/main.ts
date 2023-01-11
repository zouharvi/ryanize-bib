import { DEVMODE } from "./globals"
export var UID: string
import { load_data } from './connector'
import { setup_navigation, load_cur_text } from "./worker_website"
import { range } from "./utils";
import {parseBibFile} from "bibtex";

globalThis.phase = -1;
globalThis.data = null

const urlParams = new URLSearchParams(window.location.search);
globalThis.uid = urlParams.get('uid');

setup_navigation()


$("#button_go").on("click", () => {
    console.log("CLICKED")
    const bibFile = parseBibFile($("#main_editable").val() as string)
     
    console.log(
        Object.getOwnPropertyNames(bibFile)
    )
    console.log(
        bibFile["entries$"]
    )
})

const DEFAULT_TEXT = `
@inproceedings{mermer2010unsupervised,
    title={Unsupervised search for the optimal segmentation for statistical machine translation},
    author={Mermer, Co{\c{s}}kun},
    booktitle={Proceedings of the ACL 2010 Student Research Workshop},
    pages={31--36},
    year={2010},
    url={https://aclanthology.org/P10-3006/}
  }
  
  @inproceedings{kudo2018subword,
    title={Subword Regularization: {I}mproving Neural Network Translation Models with Multiple Subword Candidates},
    author={Kudo, Taku},
    booktitle={Proceedings of the 56th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)},
    pages={66--75},
    year={2018},
    url={https://aclanthology.org/P18-1007/}
  }
  
  @book{bell1990text,
    title={Text compression},
    author={Bell, Timothy C and Cleary, John G and Witten, Ian H},
    year={1990},
    publisher={Prentice-Hall, Inc.}
  }
  
  @article{campbell1965coding,
    title={A coding theorem and {R}{\'e}nyi's entropy},
    author={Campbell, L Lorne},
    journal={Information and control},
    volume={8},
    number={4},
    pages={423--429},
    year={1965},
    url={https://www.sciencedirect.com/science/article/pii/S0019995865903323}
  }
  
  @article{domingo2018much,
    title={How much does tokenization affect neural machine translation?},
    author={Domingo, Miguel and Garc{\i}a-Mart{\i}nez, Mercedes and Helle, Alexandre and Casacuberta, Francisco and Herranz, Manuel},
    journal={arXiv preprint arXiv:1812.08621},
    year={2018}
  }
  
  @inproceedings{kumar2022bpe,
    title={BPE beyond Word Boundary: How NOT to use Multi Word Expressions in Neural Machine Translation},
    author={Kumar, Dipesh and Thawani, Avijit},
    booktitle={Proceedings of the Third Workshop on Insights from Negative Results in NLP},
    pages={172--179},
    year={2022}
  }
  
  @article{dramko2022dire,
    title={DIRE and its Data: Neural Decompiled Variable Renamings with Respect to Software Class},
    author={Dramko, Luke and Lacomis, Jeremy and Yin, Pengcheng and Schwartz, Edward J and Allamanis, Miltiadis and Neubig, Graham and Vasilescu, Bogdan and Le Goues, Claire},
    journal={ACM Transactions on Software Engineering and Methodology},
    year={2022},
    publisher={ACM New York, NY}
  }
  
  @article{tarres2022tackling,
    title={Tackling Low-Resourced Sign Language Translation: UPC at WMT-SLT 22},
    author={Tarr{\'e}s, Laia and G{\'a}llego, Gerard I and Gir{\'o}-i-Nieto, Xavier and Torres, Jordi},
    journal={arXiv preprint arXiv:2212.01140},
    year={2022}
  }
  
  @article{gowda2022checks,
    title={Checks and Strategies for Enabling Code-Switched Machine Translation},
    author={Gowda, Thamme and Gheini, Mozhdeh and May, Jonathan},
    journal={arXiv preprint arXiv:2210.05096},
    year={2022}
  }
  
  @inproceedings{xu2021bert,
    title={BERT, mBERT, or BiBERT? A Study on Contextualized Embeddings for Neural Machine Translation},
    author={Xu, Haoran and Van Durme, Benjamin and Murray, Kenton},
    booktitle={Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing},
    pages={6663--6675},
    year={2021}
  }
  
  @inproceedings{storer1978macro,
    title={The macro model for data compression},
    author={Storer, James A and Szymanski, Thomas G},
    booktitle={Proceedings of the tenth annual ACM symposium on Theory of computing},
    pages={30--39},
    year={1978}
  }
  
  @inproceedings{provilkov2020bpe,
    title={BPE-Dropout: Simple and Effective Subword Regularization},
    author={Provilkov, Ivan and Emelianenko, Dmitrii and Voita, Elena},
    booktitle={Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics},
    pages={1882--1892},
    year={2020}
  }
  
  @inproceedings{wang2020neural,
    title={Neural machine translation with byte-level subwords},
    author={Wang, Changhan and Cho, Kyunghyun and Gu, Jiatao},
    booktitle={Proceedings of the AAAI Conference on Artificial Intelligence},
    volume={34/05},
    pages={9154--9160},
    year={2020}
  }
  % number={05},
  
  @inproceedings{xu2021vocabulary,
    title={Vocabulary Learning via Optimal Transport for Neural Machine Translation},
    author={Xu, Jingjing and Zhou, Hao and Gan, Chun and Zheng, Zaixiang and Li, Lei},
    booktitle={Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (Volume 1: Long Papers)},
    pages={7361--7373},
    year={2021}
  }
  
  @inproceedings{birch2008predicting,
    title={Predicting success in machine translation},
    author={Birch, Alexandra and Osborne, Miles and Koehn, Philipp},
    booktitle={Proceedings of the 2008 Conference on Empirical Methods in Natural Language Processing},
    pages={745--754},
    year={2008}
  }
  
  @inproceedings{ataman2018evaluation,
    title={An evaluation of two vocabulary reduction methods for neural machine translation},
    author={Ataman, Duygu and Federico, Marcello},
    booktitle={Proceedings of the 13th Conference of the Association for Machine Translation in the Americas (Volume 1: Research Track)},
    pages={97--110},
    year={2018}
  }
  
  @inproceedings{jean2015using,
    title={On Using Very Large Target Vocabulary for Neural Machine Translation},
    author={Jean, S{\'e}bastien and Cho, Kyunghyun and Memisevic, Roland and Bengio, Yoshua},
    booktitle={Proceedings of the 53rd Annual Meeting of the Association for Computational Linguistics and the 7th International Joint Conference on Natural Language Processing (Volume 1: Long Papers)},
    pages={1--10},
    year={2015}
  }
  
  @article{ling2015character,
    title={Character-based neural machine translation},
    author={Ling, Wang and Trancoso, Isabel and Dyer, Chris and Black, Alan W},
    journal={arXiv preprint arXiv:1511.04586},
    year={2015}
  }
  
  @inproceedings{costa2016character,
    title={Character-based Neural Machine Translation},
    author={Costa-juss{\`a}, Marta R and Fonollosa, Jos{\'e} AR},
    booktitle={Proceedings of the 54th Annual Meeting of the Association for Computational Linguistics (Volume 2: Short Papers)},
    pages={357--361},
    year={2016}
  }
  
  @article{l2016vocabulary,
    title={Vocabulary selection strategies for neural machine translation},
    author={L'Hostis, Gurvan and Grangier, David and Auli, Michael},
    journal={arXiv preprint arXiv:1610.00072},
    year={2016}
  }
  
  @inproceedings{galle2019investigating,
      title = "Investigating the Effectiveness of {BPE}: The Power of Shorter Sequences",
      author = {Gall{\'e}, Matthias},
      booktitle = "Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP)",
      month = nov,
      year = "2019",
      address = "Hong Kong, China",
      publisher = "Association for Computational Linguistics",
      url = "https://aclanthology.org/D19-1141",
      doi = "10.18653/v1/D19-1141",
      pages = "1375--1381",
  }
  
  @article{shannon1948mathematical,
    title={A mathematical theory of communication},
    author={Shannon, Claude Elwood},
    journal={The Bell system technical journal},
    volume={27},
    number={3},
    pages={379--423},
    year={1948},
    publisher={Nokia Bell Labs},
    url={https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=6773024},
  }
  
  @inproceedings{mi2016vocabulary,
    title={Vocabulary Manipulation for Neural Machine Translation},
    author={Mi, Haitao and Wang, Zhiguo and Ittycheriah, Abe},
    booktitle={Proceedings of the 54th Annual Meeting of the Association for Computational Linguistics (Volume 2: Short Papers)},
    pages={124--129},
    year={2016}
  }
  
  @inproceedings{gowda2020finding,
    title={Finding the Optimal Vocabulary Size for Neural Machine Translation},
    author={Gowda, Thamme and May, Jonathan},
    booktitle={Findings of the Association for Computational Linguistics: EMNLP 2020},
    pages={3955--3964},
    year={2020},
    url={https://aclanthology.org/2020.findings-emnlp.352/},
  }
  
  @article{littlestone1986relating,
    title={Relating data compression and learnability},
    author={Littlestone, Nick and Warmuth, Manfred},
    year={1986},
    journal={Unpublished},
  }
  
  @article{david2016supervised,
    title={Supervised learning through the lens of compression},
    author={David, Ofir and Moran, Shay and Yehudayoff, Amir},
    journal={Advances in Neural Information Processing Systems},
    volume={29},
    year={2016}
  }
  
  @article{mielke2021between,
    title={Between words and characters: A Brief History of Open-Vocabulary Modeling and Tokenization in NLP},
    author={Mielke, Sabrina J and Alyafeai, Zaid and Salesky, Elizabeth and Raffel, Colin and Dey, Manan and Gall{\'e}, Matthias and Raja, Arun and Si, Chenglei and Lee, Wilson Y and Sagot, Beno{\^\i}t and others},
    journal={arXiv preprint arXiv:2112.10508},
    year={2021}
  }
  @article{gage1994,
    title={A new algorithm for data compression},
    author={Philip Gage},
    journal={The C Users Journal archive},
    year={1994},
    volume={12},
    pages={23-38}
  }
  @inproceedings{sennrich2016,
    title={Neural Machine Translation of Rare Words with Subword Units},
    author={Sennrich, Rico and Haddow, Barry and Birch, Alexandra},
    booktitle={Proceedings of the 54th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)},
    pages={1715--1725},
    year={2016}
  }
  @article{welch1984,
    title={A technique for high-performance data compression},
    author={Welch, Terry A.},
    journal={Computer},
    volume={17},
    number={06},
    pages={8--19},
    year={1984},
    publisher={IEEE Computer Society}
  }
  @article{sarawagi2004,
    title={Semi-markov conditional random fields for information extraction},
    author={Sarawagi, Sunita and Cohen, William W},
    journal={Advances in neural information processing systems},
    volume={17},
    year={2004}
  }
`

$("#main_editable").val(DEFAULT_TEXT)