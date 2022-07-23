import {
  readFileCsv,
  removeEmptyRecord,
  tokenizeAndRemoveNoises,
} from './preprocessingData';
import { rawEmail, Email } from './model/Email';
import { KNN } from './knn';
import path from 'path';
import { crossValidate } from './cross-validation';

function rawToData(rawEmail: rawEmail): Email {
  const tokenization = tokenizeAndRemoveNoises(rawEmail.text.toLowerCase());
  const email: Email = {
    ID: rawEmail.ID,
    tokenization: tokenization,
    status: rawEmail.status,
  };
  return email;
}

async function main() {
  //#region Preprocessing data ......
  // ReadFile csv
  let rawEmails = (await readFileCsv(
    path.join(path.dirname(__dirname), 'spam_ham_dataset.csv')
  )) as rawEmail[];
  // Tokenize and remove noise
  let emails = rawEmails.map((email) => {
    return rawToData(email);
  }) as Email[];

  const trainTestSplit = require('train-test-split');

  const data = removeEmptyRecord(emails);

  const [train, test] = trainTestSplit(data, 0.7, 34);

  //#endregion
  const knnModel = new KNN(3, train);
  knnModel.train(test);

  crossValidate(5, train, 'knn');
}

main();
