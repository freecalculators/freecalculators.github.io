# Nayi post kaise daalni hai (roz ka kaam, 2 minute)

1. GitHub par apni repository kholo.
2. **Add file → Create new file** dabao.
3. Naam is tarah likho (folder ka naam `_posts/` se shuru karna zaroori hai):

       _posts/2026-10-12-post-ka-naam.md

   - Pehle **aaj ki date** `YYYY-MM-DD` me, phir `-`, phir post ka naam.
   - Naam me sirf chhote akshar (a-z), numbers aur `-` use karo. Space mat do.
   - Is naam se URL banega: `/blog/post-ka-naam/`

4. Neeche is template ko paste karo aur apna text likho:

       ---
       title: "Post ka title yahan"
       description: "Google me dikhne wali 1-2 line ki summary (150 akshar ke aas-paas)."
       calcs: [percentage, standard]
       ---

       Yahan aapki post shuru hoti hai.

       ## Ek heading

       Normal paragraph. **Bold** text aur [link](https://example.com).

       - bullet 1
       - bullet 2

   **`calcs:` line ka matlab:** post kis calculator se judi hai, wo yahan likho. Options:
   `scientific`, `standard`, `fractions`, `graphing`, `percentage`, `love`.
   Isse post ke neeche un calculators ke links aate hain, aur us calculator ke page par
   "Related Articles" me ye post apne aap dikhti hai. Ye line na likho to bhi post blog me aayegi.

5. **Commit changes** dabao. 1-2 minute me post blog page aur home page par aa jayegi.

## Dhyan rakhne wali baatein

- Post ki date **aaj ya pehle ki** rakho. Aage ki date wali post bhi dikh jayegi (site me `future: true` hai).
- `---` wali upar-neeche ki lines hata mat dena, warna post nahi dikhegi.
- Pages me **Settings → Pages → Source = Deploy from a branch** hi rakho. "GitHub Actions" mat chunna.
- `.nojekyll` naam ki file repository me mat banana.
- Post me `{{` ya `{%` mat likhna, ye Jekyll ke special signs hain.
- Post badalni ho to file kholo, pencil icon dabao, edit karke commit karo.
- Post hatani ho to file kholo, kachre ka dabba (delete) icon dabao aur commit karo.
- Agar site me kuch toot jaye to **Actions** tab me dekho, wahan lal X ke saath error likha hoga.

## Domain jodne ke baad (ek baar karna hai)

`_config.yml` kholo (pencil icon) aur ye do line badlo:

    url: "https://aapka-domain.com"
    baseurl: ""

Phir commit karo. Isse sitemap, canonical links aur saare internal links domain ke hisaab se sahi ho jayenge.

**Zaroori:** ye badlav Pages me custom domain save karne ke **turant baad** karo. Domain chalu hone ke baad bhi
`baseurl` purana (`/my-calculator`) rahega to site ke menu, CSS aur links toot jayenge.

## Site ka naam badalna

`_config.yml` me `title: CalcZone` ko apne naam se badal do. Header, footer aur Google title me wahi naam aa jayega.
