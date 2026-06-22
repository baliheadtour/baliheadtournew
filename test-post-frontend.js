async function run() {
  const payload = {
    title: "10 Hidden Beaches in Bali You Need to Visit in 2026",
    location: "",
    category: "Beach",
    slug: "/blog/10-hidden-beaches-in-bali-you-need-to-visit-in-2026",
    meta: "Discover 10 hidden beaches in Bali...",
    status: "Published",
    image: "",
    images: [],
    content: "Content test",
    id: "74ab4cb2-e2fe-436d-bcd6-adbdaaab9d61"
  };

  const res = await fetch('http://localhost:3000/api/admin/blogs', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}
run();
