To change images or music for everyone (Vercel, all devices):
1. Edit config.json in this folder.
2. Music: use a direct link (e.g. Dropbox with ?dl=1 at the end).
3. Images: Imgur album links (imgur.com/a/xxx) often don't show. For reliable display:
   - Open your image on Imgur, right-click the image → "Copy image address"
   - The link should look like https://i.imgur.com/XXXXX.jpg or .png
   - Put that link in config.json for discordImage, leftImage, or rightImage.
4. Save, then: git add config.json && git commit -m "Update media" && git push origin main
