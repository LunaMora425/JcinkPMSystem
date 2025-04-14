async function initializePMListView() {
  let userVIDs = [];
  let userPMsList = [];

  let href = `https://barbermonger.me/index.php?act=Msg&CODE=01`;
  let data = '';
  try {
    console.log('fetching PM List View - Inbox test');
    const response = await fetch(href);
    data = await response.text();
    console.log('success!');
  } catch (err) {
    console.log(`Ajax error loading page: ${href} - ${err.status} ${err.statusText}`);
    return;
  }
  let doc = new DOMParser().parseFromString(data, 'text/html');

  userVIDs = createVIDList(doc);
  console.log('userVIDs: ', userVIDs);

  userPMsList = createPMListObject(doc);
  console.log('userPMsList: ', userPMsList);

  const originalPMContainer = document.querySelector('#innerwrapper > table');

  // originalPMContainer.innerHTML = `If you're seeing this, the script is running. :)`;

  originalPMContainer.innerHTML = `<div id="pm-ui"><div id="pm-menu"><!-- menu here --><h1>Menu</h1><h2>Compose</h2><ul><li><a href="">Compose New Message</a></li><li><a href="">View Saved / Unsent PMs</a></li><li><a href="">View Tracked Messages</a></li></ul><h2>PM Folders</h2><ul id="pm-folders"><!-- this is where the userVID loop should go --></ul><h2>PM Settings</h2><ul><li><a href="">Manage Contacts</a></li><li><a href="">Archive Messages</a></li><li><a href="">Mass Delete Messages</a></li><li><a href="">Manage PM Folders</a></li></ul></div><div id="pm-listview"><!-- PM index here --></div></div>`;

  buildPMFoldersList(userVIDs);
}

/**
 * Extract folder VIDs from the dropdown selector in the document
 * @param {Document} doc - The parsed HTML document
 * @returns {Array} Array of folder objects with id and name
 */
const createVIDList = (doc) => {
  const folderVIDs = [];
  const dropdownSelector = doc.querySelector('select[name="VID"]');

  if (dropdownSelector) {
    for (let i = 0; i < dropdownSelector.options.length; i++) {
      folderVIDs.push({
        id: dropdownSelector.options[i].value,
        name: dropdownSelector.options[i].text,
      });
    }
  } else {
    console.log('Dropdown not found');
  }

  return folderVIDs;
};

/**
 * Extract folder VIDs from the dropdown selector in the document
 * @param {Document} doc - The parsed HTML document
 * @returns {Array} Array of folder objects with id and name
 */
const createPMListObject = (doc) => {
  const userPMsList = [];
  const pmOriginalTableList = doc.querySelectorAll('tr.dlight');

  pmOriginalTableList.forEach((pmRow) => {
    const cells = pmRow.querySelectorAll('td');

    // grab the new PM/no new PM indicator
    const ReadIndicator = cells[0].innerHTML;
    // grab the Message Title and MSID
    const messageTitle = cells[1].innerHTML;
    const messageTitleLink = cells[1].querySelector('a');
    const MSID = messageTitleLink.href.split('MSID=')[1];
    // grab the Sender
    const sender = cells[2].innerHTML;
    // grab the Date
    const date = cells[3].innerHTML;
    // grab the checkbox
    const checkbox = cells[4].innerHTML;

    userPMsList.push({
      id: MSID,
      read: ReadIndicator,
      title: messageTitle,
      sender: sender,
      date: date,
      checkbox: checkbox,
    });
  });

  return userPMsList;
};

/**
 * Build the PM Folders with the dynamic user input
 * @param {Array} userVIDs - Array of folder objects with id and name
 */
const buildPMFoldersList = (userVIDs) => {
  const listContainer = document.querySelector('#pm-folders');
  userVIDs.forEach((folder) => {
    const { id, name } = folder;
    const listLink = document.createElement('li');
    listLink.innerHTML = `<a href="?act=Msg&CODE=01&VID=${id}" title="${name}" vid="${id}">${name}</a>`;
    listContainer.append(listLink);
  });
};
