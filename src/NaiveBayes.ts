import { Email } from './model/Email';

export class NaiveBayes {
  private spamArray: string[] = [];
  private hamArray: string[] = [];
  private vocabulary: string[] = [];
  private priorHamProb: number = 0.5;
  private priorSpamProb: number = 0.5;
  private spamPropMap: Map<string, number> = new Map();
  private hamPropMap: Map<string, number> = new Map();
  private rawTrainingSet: string[] = [];

  constructor(data: Email[]) {
    /**
     * Concatenate all array from raw data
     */
    const rawSpamSet: any[] = [];
    const rawHamSet: any[] = [];

    data.forEach((el: any) => {
      this.rawTrainingSet.push(el.tokenization);
      if (el.status === 0) {
        rawHamSet.push(el.tokenization);
      } else {
        rawSpamSet.push(el.tokenization);
      }
    });

    /**
     * Process raw sets
     */
    this.vocabulary = [...new Set(this.rawTrainingSet.flat())].sort(); // an array contains all words without duplicated [w1, w2, w3...]
    this.spamArray = [...rawSpamSet.flat()].sort(); // an array contains all words in spam class [w1, w2, w1, w3...]

    //   const spamArray: any[] = []; // an array contains all words in spam class [w1, w2, w1, w3...]
    this.hamArray = [...rawHamSet.flat()].sort(); // an array contains all words in ham class [w1, w2, w1, w3...]
  }

  public train(): void {
    console.log('Start training!');
    const hamMap = new Map();
    this.vocabulary.forEach((word: any) => {
      /**
       * Set the initial value of the hashmap equal to 1 (this is called black box)
       * to avoid the probability of the word equal to 0
       */
      hamMap.set(word, 1);
    });
    const spamMap = new Map(hamMap);

    /**
     * Count the number of the occurrence of each word in spam set
     * s: spam word
     * n: normal word
     */
    this.spamArray.forEach((s: any) => {
      spamMap.set(s, spamMap.get(s) + 1);
    });
    this.hamArray.forEach((n: any) => {
      hamMap.set(n, hamMap.get(n) + 1);
    });

    const spamCount = this.spamArray.length;
    const hamCount = this.hamArray.length;

    /**
     * Create 2 maps corresponding to the probabilities of normal and spam words
     * This is P(xi|c): Probability of an word known its class (normal or spam)
     * Format: xxxPropMap: { word: prob}
     *
     * Formula: P(xi|c) = Occurrence of word / Total words (including the duplicates) + Total black boxes added
     *
     * Total black boxes added = Total of word set that does not have duplicated values
     */
    const totalBlackBoxesAdded = this.vocabulary.length;

    for (const [key, value] of hamMap.entries()) {
      this.hamPropMap.set(key, value / (hamCount + totalBlackBoxesAdded));
    }

    for (const [key, value] of spamMap.entries()) {
      this.spamPropMap.set(key, value / (spamCount + totalBlackBoxesAdded));
    }

    /**
     * Prior probability of each class (Spam | Normal)
     * Formula: P(c) = size of class c (having duplicated values) / total training words set (having duplicated values)
     */
    this.priorHamProb =
      this.hamArray.length / this.rawTrainingSet.flat().length;
    this.priorSpamProb = 1 - this.priorHamProb;

    console.log('End training!');
  }

  public predict(record: { id?: string | number; tokenization: any[] }) {
    /**
     * Calculate P(c|X): Probability of the class give the words.
     *
     * Use log to avoid underflow
     */
    let predictHam = Math.log2(this.priorHamProb);
    let predictSpam = Math.log2(this.priorSpamProb);

    record.tokenization.forEach((x) => {
      predictHam += Math.log2(this.hamPropMap.get(x) || 0.5);
      predictSpam += Math.log2(this.spamPropMap.get(x) || 0.5);
    });

    if (predictHam >= predictSpam) {
      return 0;
    }

    return 1;
  }
}
