chrome.runtime.onMessage.addListener(
  (request, _, responseCallback) => {
    fetch(request.url)
    .then(response => response.text())
    .then(html => {
      const ogProperties = {};

      const metaRegex = /<meta\s*(?:(?:\b[\w|-]+\b\s*(?:=\s*(?:"[^"]*"|'[^']*'|[^"'<> ]+)\s*)?)*)\/?\s*>/ig;
      const attributeRegex = /(\b[\w|-]+\b)\s*=\s*(?:"([^"]*)"|'([^']*)'+|([^"'<> ]+)\s*)+/ig;

      let matchedMetaTag;
      while (matchedMetaTag = metaRegex.exec(html)) {
        console.debug(matchedMetaTag[0]);
        const tagData = {};
        for (const matchedAttribute of matchedMetaTag[0].matchAll(attributeRegex)) {
          console.debug(`parsed attribute: ${matchedAttribute[1]} = "${matchedAttribute[2]}", '${matchedAttribute[3]}', ${matchedAttribute[4]}`);

          const attributeName = matchedAttribute[1].toLowerCase();
          let attributeValue = matchedAttribute[2] || matchedAttribute[3] || matchedAttribute[4];
          if (attributeName === 'property') {
            console.debug("found property tag with value", attributeValue);
            const ogMatch = attributeValue.match(/og:(.*)/);

            if (ogMatch) {
              tagData.key = ogMatch[1];
            }
          } else if (attributeName === 'name') {
            attributeValue = attributeValue.toLowerCase();
            console.debug("found name tag with value", attributeValue);

            if (tagData.key === undefined) {
              if (attributeValue === 'title') {
                  tagData.key = 'title';
              } else if (attributeValue === 'description') {
                  tagData.key = 'description';
              } else {
                const twitterMatch = attributeValue.match(/twitter:(.*)/);

                if (twitterMatch) {
                  tagData.key = twitterMatch[1];
                }
              }
            }
          } else if (attributeName === 'content') {
            console.debug("found content tag with value", attributeValue);
            tagData.value = attributeValue;
          }
        }

        if (tagData.key && tagData.value) {
          ogProperties[tagData.key] = tagData.value;
        }
      }

      if (ogProperties.image) {
        fetch(ogProperties.image)
        .then(response => response.blob())
        .then(data => {
          const fileReader = new FileReader();

          fileReader.addEventListener('load', () => {
            ogProperties.image = fileReader.result;
            responseCallback({id: request.id, properties: ogProperties});
          });

          fileReader.readAsDataURL(data);
        })
      } else {
        responseCallback({id: request.id, properties: ogProperties});
      }
    });
    return true;
  }
);