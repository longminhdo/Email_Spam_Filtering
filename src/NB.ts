import path from 'path';
import { Email, rawEmail } from './model/Email';
import { NaiveBayes } from './NaiveBayes';
import {
  readFileCsv,
  removeEmptyRecord,
  tokenizeAndRemoveNoises,
} from './preprocessingData';
const trainTestSplit = require('train-test-split');

function rawToData(rawEmail: rawEmail): Email {
  const tokenization = tokenizeAndRemoveNoises(rawEmail.text.toLowerCase());
  const email: Email = {
    ID: rawEmail.ID,
    tokenization: tokenization,
    status: rawEmail.status,
  };
  return email;
}

const getRawData = async (filename: string) => {
  /**
   * Read file CSV
   */
  let rawEmails = (await readFileCsv(
    path.join(path.dirname(__dirname), filename)
  )) as rawEmail[];

  /**
   * Tokenize and remove noise
   */
  let emails = rawEmails.map((email) => {
    return rawToData(email);
  }) as Email[];

  return emails;
};

const main = async () => {
  /**
   * emails in the form of
   * array of objects: [{id, tokenization, status}, {}]
   */

  const emails = await getRawData('spam_ham_dataset.csv');

  const data = removeEmptyRecord(emails);

  /**
   * Split training and test set
   * with the ratio of 0.8 and 0.2 respectively
   */
  const [train, test] = trainTestSplit(data, 0.7, 34);

  const nb = new NaiveBayes(train);

  nb.train();

  const calculateAccuracy = (testSet: Email[]) => {
    let totalCorrectResults = 0;

    //ham set is positive
    let tp = 0;
    let fp = 0;
    let fn = 0;
    testSet.forEach((t) => {
      if (nb.predict(t) === t.status) {
        totalCorrectResults++;
        if (t.status === 0) {
          tp++;
        }
      } else {
        if (t.status === 1) {
          fn++;
        } else {
          fp++;
        }
      }
    });

    let pre = tp / (tp + fp);
    let rec = tp / (tp + fn);
    console.log('F1 Score:', (2 * pre * rec) / (pre + rec));

    console.log('Accuracy:', totalCorrectResults / testSet.length); // acc score
  };

  calculateAccuracy(test);
};

main();
