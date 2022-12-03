import axios from "axios";
import FormData from 'form-data'

export const uploadImg = async (imageFile) => {
  console.log(imageFile);
  const form = new FormData();
  form.append('image', imageFile);
  console.log(...form);

  const response = await axios({
    method: 'post',
    url: 'https://api.imgbb.com/1/upload',
    params: {
      key: "bbdc5983519927b7f63ffeda5e6aad41"
    },
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: form

  });
  // console.log(response.data.data.image)
  return response.data.data
}

