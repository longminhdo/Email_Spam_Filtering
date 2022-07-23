// The KNN model

import { EmailStatus, Email } from './model/Email';
type WordCount = {
  [key: string]: number;
};

type trainingValue = {
  wordCounts: WordCount;
  status: EmailStatus;
};

function AutoBind(
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjustabledescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjustabledescriptor;
}

export class KNN {
  private trainingMap: trainingValue[] = [];
  private _accuracy: string = '0';
  private _F1Score: string = '0';

  get accuracy(): string {
    return this._accuracy;
  }
  get F1Score(): string {
    return this._F1Score;
  }

  constructor(private k: number, trainingData: Email[]) {
    for (const data of trainingData) {
      this.trainingMap.push({
        wordCounts: this.getCount(data.tokenization),
        status: data.status,
      });
    }
  }

  public train(testData: Email[]) {
    // TP: True positive
    // FP: false positive
    // TN: true negative
    // FN: Flase negative
    let similarity = 0;
    let TP = 0;
    let TN = 0;
    for (const data of testData) {
      let label = this.predict(data.tokenization);
      if (label == data.status) {
        similarity += 1;
        if (label == EmailStatus.Ham) {
          TP++;
        } else {
          TN++;
        }
      }

      // console.log('Similarity: ', similarity);
    }

    let FP =
      testData.filter((data) => data.status == EmailStatus.Ham).length - TP;
    let FN =
      testData.filter((data) => data.status == EmailStatus.Spam).length - TN;
    let precision = parseFloat(TP.toString()) / (TP + FP);
    let recall = parseFloat(TP.toString()) / (TP + FN);

    this._F1Score = ((2 * (precision * recall)) / (precision + recall)).toFixed(
      2
    );
    console.log('F1 score: ' + this._F1Score);
    this._accuracy = (
      (parseFloat(similarity.toString()) / testData.length) *
      100
    ).toFixed(2);
    console.log('Accuracy: ' + this._accuracy);
  }

  private getCount(arrayText: string[]): WordCount {
    let wordCountArray: WordCount = {};
    for (const word of arrayText) {
      if (!wordCountArray.hasOwnProperty(word)) {
        wordCountArray[word] = 1;
      } else {
        wordCountArray[word]++;
      }
    }
    return wordCountArray;
  }

  private euclideanDistance(
    trainingText: WordCount,
    testText: WordCount
  ): number {
    let distance = 0;
    for (const trainKey of Object.keys(trainingText)) {
      if (trainKey in Object.keys(testText)) {
        distance += (trainingText[trainKey] - testText[trainKey]) ** 2;
      } else {
        distance += trainingText[trainKey] * trainingText[trainKey];
      }
      delete testText[trainKey];
    }
    for (const testKey of Object.keys(testText)) {
      distance += testText[testKey] ** 2;
    }
    distance = Math.sqrt(distance);
    return distance;
  }

  @AutoBind
  public predict(emailText: string[]): EmailStatus {
    const wordCount = this.getCount(emailText);
    let neighbors = [];
    for (const data of this.trainingMap) {
      neighbors.push({
        distance: this.euclideanDistance(data.wordCounts, wordCount),
        label: data.status,
      });
    }
    neighbors.sort((a, b) => a.distance - b.distance);
    neighbors = neighbors.slice(0, this.k - 1);
    return neighbors.filter((neightbor) => neightbor.label == EmailStatus.Spam)
      .length > Math.ceil(this.k / 2)
      ? EmailStatus.Spam
      : EmailStatus.Ham;
  }
}
