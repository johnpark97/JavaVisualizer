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
    collectionSet.add('None');
    return ['None'];
  }

  const types = [];
  collections.forEach((c) => {
    if (c[name] && c[name].length > 0 && c[name][0].Collection) {
      types.push(c[name][0].Collection);
      collectionSet.add(c[name][0].Collection);
    }
  });
  return types;
}

const formatData = (data) => {
  collectionSet.clear();
  let links = [];

  if (data.links) {
    data.links.forEach((link) => {
      link.Dependencies.forEach((dependency) => {
        dependency.ClassNames.forEach((cname) => {
          links.push({
            source: link.Class,
            target: cname,
            type: formatType(dependency),
          });
        });
      });
    });
  }

  if (data.classes) {
    data.classes.forEach((c, idx) => {
      const smellsArr = c.Information.trim().split('\n').slice(1);
      c.smells = [];
      smellsArr.forEach((smell) => {
        const parts = smell.split(':');
        c.smells.push({
          name: parts[0],
          description: parts.slice(1).join().trim(),
        });
      });
    });
  }

  return {
    classes: data.classes,
    links,
    collections: Array.from(collectionSet),
  };
}