import { KNN } from './knn';
import { NaiveBayes } from './NaiveBayes';

const shuffle = (array: any, seed: number) => {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + seed));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

const crossValidate = (k: number, data: any, classifier: string) => {
  //random data
  console.log(
    `${
      classifier === 'nb' ? 'Naive Bayes' : 'KNN'
    } cross validation with k fold = ${k} `
  );
  const dataCopy = [...data];
  shuffle(dataCopy, 5);

  const foldSize = Math.ceil(dataCopy.length / k);

  for (let i = 0; i < k; i++) {
    const testTmp = dataCopy.slice(i * foldSize, (i + 1) * foldSize);
    const tmp = dataCopy.slice(0, i * foldSize);
    const trainTmp = [
      ...tmp,
      ...dataCopy.slice((i + 1) * foldSize),
      k * foldSize,
    ];

    const test = testTmp.filter((t) => t.tokenization?.length > 0);
    const train = trainTmp.filter((t) => t.tokenization?.length > 0);
    if (classifier === 'nb') {
      const nb = new NaiveBayes(train);
      nb.train();

      let totalCorrectResults = 0;
      test.forEach((t) => {
        if (nb.predict(t) === t.status) {
          totalCorrectResults++;
        }
      });

      console.log(`${i}th:`, totalCorrectResults / test.length);
    }

    if (classifier === 'knn') {
      console.log(`${i}th k = ${i * 3}`);
      const knn = new KNN(i * 3, train);
      knn.train(test);
      // knn.getAccuracy();
    }

    // console.log('test', i * foldSize, (i + 1) * foldSize);
    // console.log('train', 0, i * foldSize, (i + 1) * foldSize, k * foldSize);
  }
};

export { crossValidate };
