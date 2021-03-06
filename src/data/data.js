const githubHost = 'https://api.github.com';

const backendHost = 'http://localhost:8000';
const dataEndpoint = '/data';
const dataFromZipEndpoint = '/dataFromZip';

const extensions = ["js", "css", "java"];

let returnedList = [];
const collectionSet = new Set();

const repoFilesEndpoint = (owner, repo) => {
  return `/repos/${owner}/${repo}/contents/`;
};

const getData = async (repoURL) => {
  let resultList = await getHashMap(repoURL);
  const returnedString = resultList.toString();

  console.log("RESULT")
  console.log(resultList);

  console.log("String");
  console.log(returnedString);

  const url = backendHost + dataEndpoint;
  // send github url to backend
  const res = await httpRequest(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json'
    },
    body: returnedString // body data type must match "Content-Type" header
  });

  return res;
};

async function inputHashMap(listOfFiles) {
  for (const element of listOfFiles) {
    if (element['type'] === 'dir') {
      const url = element['url'];
      const nextListOfFiles = await httpRequest(url, {
        method: 'GET',
      });
      await inputHashMap(nextListOfFiles);
    } else if (element['type'] === 'file' && isCodeFile(element['name'])) {
      const stringElement = element['download_url'];
      returnedList.push(stringElement);
    }
  }
}

const getOwnerAndRepo = (url) => {
  const urlParts = url.split('/');
  const i = urlParts.findIndex(e => e == 'github.com');
  return {
    owner: urlParts[i + 1],
    repo: urlParts[i + 2],
  };
};

const getHashMap = async (url) => {
  const {
    owner,
    repo,
  } = getOwnerAndRepo(url);

  const repoUrl = githubHost + repoFilesEndpoint(owner, repo);
  console.log(repoUrl);

  const listOfFiles = await httpRequest(repoUrl, {
    method: 'GET',
  });

  // Clear previously returned list
  returnedList = [];

  await inputHashMap(listOfFiles);

  console.log("returnedList");
  console.log(returnedList);

  return returnedList;
}

const isCodeFile = (name) => {
  let extension = name.split(".");
  extension = extension[extension.length - 1];

  return extensions.includes(extension);
}

const readFile = async (zip) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      const res = event.target.result;
      resolve(res);
    });
    reader.readAsArrayBuffer(zip);
  });
}

const postZip = async (zip) => {
  const url = backendHost + dataFromZipEndpoint;

  return await httpRequest(url, {
    method: 'POST',
    body: zip,
  });
}

const formatType = (dependency) => {
  if (!dependency) return [];

  const collections = dependency.Collection;
  const name = dependency.DependencyName;

  if (collections.length == 0) {
    const label = 'Regular dependency'
    collectionSet.add(label);
    return [label];
  }

  const types = [];
  collections.forEach((c) => {
    if (c[name] && c[name].length > 0 && c[name][0].Collection) {
      const collectionName = `${c[name][0].Collection}<E>`;
      types.push(collectionName);
      collectionSet.add(collectionName);
    }
  });
  return types;
}

const formatData = (data) => {
  collectionSet.clear();
  let links = [];

  const classTraffic = {};

  console.log(data);
  if (data.links) {
    data.links.forEach((link) => {
      link.Dependencies.forEach((dependency) => {
        dependency.ClassNames.forEach((cname) => {
          links.push({
            source: link.Class,
            target: cname,
            type: formatType(dependency),
          });
          if (!classTraffic[link.Class]) classTraffic[link.Class] = 1;
          else classTraffic[link.Class]++;
          if (!classTraffic[cname]) classTraffic[cname] = 1;
          else classTraffic[cname]++;
        });
      });
    });
  }

  const smellSum = {};
  if (data.classes) {
    data.classes.forEach((c, idx) => {
      const smellsArr = c.Information.trim().split('\n').slice(1);
      const smellCount = {};
      c.smells = [];

      smellsArr.forEach((smell) => {
        const parts = smell.split(':');
        const name = parts[0];

        c.smells.push({
          name,
          description: parts.slice(1).join().trim(),
        });

        if (!smellCount[name]) smellCount[name] = 1;
        else smellCount[name]++;

        if (!smellSum[name]) smellSum[name] = 1;
        else smellSum[name]++;
      });

      c.smellCount = []
      if (Object.keys(smellCount).length > 0) {
        Object.keys(smellCount).forEach((smell) => {
          c.smellCount.push({
            name: smell,
            count: smellCount[smell],
          });
        });
      }

      c.traffic = classTraffic[c.name];
    });
  }

  const smellCountSum = [];
  if (Object.keys(smellSum).length > 0) {
    Object.keys(smellSum).forEach((smell) => {
      smellCountSum.push({
        name: smell,
        count: smellSum[smell],
      });
    });
  }

  return {
    classes: data.classes,
    links,
    collections: Array.from(collectionSet),
    smellCountSum,
  };
}