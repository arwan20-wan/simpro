const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:8000/api';

async function run() {
  try {
    // write tiny PNG
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
    const buffer = Buffer.from(base64, 'base64');
    const imgPath = path.join(__dirname, 'tmp.png');
    fs.writeFileSync(imgPath, buffer);

    // login
    console.log('Logging in...');
    const loginRes = await axios.post(`${API_BASE}/login`, {
      username: 'pj001',
      password: '123456',
    });

    const token = loginRes.data?.token;
    if (!token) throw new Error('No token returned');
    console.log('Got token:', token.slice(0,8) + '...');

    // fetch projects
    const projectsRes = await axios.get(`${API_BASE}/pj/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const projects = projectsRes.data?.data || [];
    if (!projects.length) throw new Error('No projects found for user');
    const projectId = projects[0].id;
    console.log('Using project id', projectId, projects[0].name);

    // prepare formdata
    const form = new FormData();
    form.append('report_date', new Date().toISOString().split('T')[0]);
    form.append('work_description', 'Test upload from script');
    form.append('weather', 'Cerah');
    form.append('progress_percent', '10');
    form.append('notes', 'Automated test');
    form.append('photos[]', fs.createReadStream(imgPath));

    console.log('Uploading report...');
    const uploadRes = await axios.post(`${API_BASE}/pj/projects/${projectId}/daily-reports`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
      maxBodyLength: Infinity,
    });

    console.log('Upload response:', uploadRes.status, uploadRes.data.message || uploadRes.data);

    // cleanup
    fs.unlinkSync(imgPath);
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

run();
