# DIVERGENT — The Cybersecurity Initiative

A cinematic, browser-based cybersecurity learning experience with one homepage and exactly three interactive vulnerability laboratories. It features three original chapter environments, created for this project and inspired by dystopian science-fiction moods; no film stills, posters, logos, or actor likenesses are included.

## Run locally

No build tools, backend, database, or installation are needed. Unzip the project and open `index.html` in a modern browser. For a local HTTP server (optional), run `python3 -m http.server 8000` from the project folder, then open `http://localhost:8000`.

## Pages

- `index.html` — cinematic homepage and navigation.
- `labs/divergent.html` — IDOR / CWE-639 simulation.
- `labs/insurgent.html` — race condition / CWE-362 simulation.
- `labs/allegiant.html` — mass assignment / CWE-915 simulation.

## Structure

- `assets/` — three original cinematic chapter environment images.
- `css/style.css` — responsive industrial design system and image treatments.
- `js/labs.js` — safe local simulations, vulnerable/fixed modes, and reset interactions.
- `labs/` — exactly three laboratory pages.

## Safety and learning notes

All interactive examples run locally in JavaScript against fictional in-memory data. No backend, network attack, login, real account, or live server-side code is used. The displayed code is educational pseudocode and is not executed. The race-condition illustration uses asynchronous browser tasks to demonstrate check-then-act interleaving; it does not model database-level concurrency. Real applications need server-side authorization, field allowlists, and datastore-supported atomic operations appropriate to their architecture.

The labs identify OWASP A01:2021 for the IDOR access-control example. The other topics are not assigned a single OWASP Top 10 category because classification depends on context.

## References

- [MITRE CWE-639](https://cwe.mitre.org/data/definitions/639.html) and [OWASP IDOR Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
- [MITRE CWE-362](https://cwe.mitre.org/data/definitions/362.html) and [OWASP Race Conditions](https://owasp.org/www-community/pages/vulnerabilities/race_conditions)
- [MITRE CWE-915](https://cwe.mitre.org/data/definitions/915.html) and [OWASP Mass Assignment Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html)

*OWASP categories and taxonomies evolve. The references above define the weakness and defensive guidance; the lab's short classification labels are specific to these educational scenarios.
