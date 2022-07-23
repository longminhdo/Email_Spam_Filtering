import fs from 'fs';
import csv from 'csv-parser';
import winkNlp from 'wink-nlp';
import model from 'wink-eng-lite-model';
import its from 'wink-nlp/src/its.js';
import { Email, EmailStatus } from './model/Email';
import { lemmatizer } from 'lemmatizer';
export const nlp = winkNlp(model);

/**
 * Read file from CSV
 * @param fileName path of the file name
 * @returns Promise any
 */

export function removeEmptyRecord(data: Email[]) {
  const res = data.filter((el) => el.tokenization?.length > 0);
  return res;
}

export function readFileCsv(fileName: string): Promise<any[]> {
  const emails: Promise<any[]> = new Promise((resolve, reject) => {
    let emailRecords: any[] = [];
    fs.createReadStream(fileName)
      .pipe(csv())
      .on('data', function (data) {
        let newData = {
          ...data,
          status: data.label === 'spam' ? EmailStatus.Spam : EmailStatus.Ham,
        };
        delete newData.label_num;
        delete newData.label;
        emailRecords.push(newData);
      })
      .on('end', function () {
        resolve(emailRecords);
      })
      .on('error', function () {
        reject('Error to readfile');
      });
  });
  return emails;
}
/**
 * Tokenize the paragraph and remove the stop word, blank space, punctuation
 * Lemmatizer word
 * @param text the paragraph of the email
 * @returns string[]
 */

export function tokenizeAndRemoveNoises(text: string): string[] {
  const tokenization = nlp.readDoc(text);
  const tmp = tokenization
    .tokens()
    .filter((token) => {
      return (
        token.out(its.type) !== 'tabCRLF' &&
        token.out(its.type) !== 'punctuation' &&
        !token.out(its.stopWordFlag)
      );
    })
    .out();

  const res = tmp.map((el) => {
    let lem: any;
    try {
      lem = lemmatizer(el);
    } catch (error) {}
    return lem;
  });

  return res;
}
