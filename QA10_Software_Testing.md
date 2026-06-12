# Software Engineering Q/A Sheet (#10) — Software Testing

**date:** 2026-05-31 &nbsp; **number:** &nbsp; **name:** hskang9

---

## Questions from Prof.

### 1. Describe the two goals of software testing. Explain what a successful test that satisfies each goal is.

Software testing has two complementary goals:

**Goal 1 — Validation Testing (Demonstration)**
> Show that the software meets its requirements and does what the customer expects.

A **successful test** here is one where the system behaves correctly for a representative set of intended inputs — it passes without errors, confirming the software fulfils its specification.

**Goal 2 — Defect Testing (Destruction)**
> Discover defects or failures — inputs or sequences that cause the software to behave incorrectly.

A **successful test** here is one that *reveals a previously unknown bug* — the test breaks the system, exposing a fault that can then be fixed. A test that finds no bug is considered less useful from this perspective.

The two goals are intentionally opposite: validation seeks to build confidence, while defect testing seeks to destroy it. Both are necessary.

---

### 2. Compare three development tests: Unit, Component, and System testing

| Dimension | Unit Testing | Component Testing | System Testing |
|---|---|---|---|
| **Scope** | Single function or class | A module assembled from multiple units | The entire integrated system |
| **What is tested** | Individual logic, branches, edge cases | Interfaces between units; module behavior | End-to-end flows against system requirements |
| **Who writes it** | Developer who wrote the unit | Developer or integration team | QA/test team |
| **Dependencies** | Mocked or stubbed | Partially real, partially mocked | All real components |
| **Speed** | Very fast (milliseconds) | Moderate | Slow (may involve DB, network) |
| **Failure isolation** | Very precise | Module-level | Hard to isolate without good logging |
| **Example in our project** | Testing `calculateOverallScore()` in isolation | Testing the `Assessment` API route with a real DB transaction | Full registration → onboarding → developer profile flow |

**Key insight:** Unit tests verify correctness of logic; component tests verify correctness of interfaces; system tests verify correctness of the whole product.

---

### 3. Describe partition testing and create an example in your term project

**Partition testing** (equivalence partitioning) divides the input space into *equivalence classes* (partitions) where every value in a class is expected to cause the same program behavior. You then pick one representative value from each partition, reducing the infinite input space to a manageable test set. You should test at the boundary between partitions as well (boundary-value analysis).

**Example — `userType` field during onboarding in our project**

Our `Profile` model has a `UserType` enum with values `DEVELOPER` and `COMPANY`. The PATCH `/api/profile` endpoint accepts a `userType` field.

| Partition | Description | Representative Input | Expected Result |
|---|---|---|---|
| Valid — Developer | A recognized enum value | `"DEVELOPER"` | 200 OK, profile updated |
| Valid — Company | A recognized enum value | `"COMPANY"` | 200 OK, profile updated |
| Invalid — unknown string | Not in enum | `"ADMIN"` | 400 Bad Request |
| Invalid — null | Field explicitly nulled | `null` | 400 Bad Request |
| Invalid — missing | Field absent from body | *(omitted)* | 400 Bad Request (if required) or unchanged (if optional) |
| Invalid — wrong type | Non-string value | `123` | 400 Bad Request |

By testing one input per partition rather than every possible string, we achieve good coverage efficiently. The boundary of interest is between "valid enum member" and "anything else."

---

### 4. Explain the four interface types in component testing and the interface errors associated with each

When component testing, components interact through four types of interfaces:

**1. Parameter Interfaces**
Data is passed between components via function/method parameters.

| | |
|---|---|
| **Description** | One component calls another by passing values as arguments. |
| **Interface errors** | Wrong number of parameters; wrong data type passed; parameter value out of valid range; parameters in wrong order; using an output parameter as input. |
| **Example** | `createAssessment(userId, repoUrl, assessmentType)` — passing `null` for `userId` when the DB schema requires a non-null string. |

**2. Shared Memory Interfaces**
A block of memory (or shared state) is accessed by multiple components.

| | |
|---|---|
| **Description** | Components read and write a shared data structure (global variable, in-memory cache, shared buffer). |
| **Interface errors** | Race conditions (two components write simultaneously); one component corrupts data used by another; stale reads due to improper ordering; memory not reset between uses. |
| **Example** | A server-side in-memory session cache shared between authentication middleware and profile resolution — wrong invalidation order can leave stale user state. |

**3. Procedural Interfaces**
One component exposes a set of procedures that other components call.

| | |
|---|---|
| **Description** | Components interact through well-defined function/procedure calls (e.g., a service class, an SDK). |
| **Interface errors** | Misunderstanding the contract (pre/postconditions); calling procedures in the wrong order; ignoring return values or error codes; side effects not documented. |
| **Example** | Calling `prisma.profile.update()` before a `prisma.profile.create()` has committed in a test — violates ordering assumptions. |

**4. Message-Passing Interfaces**
Components communicate by sending and receiving messages (e.g., HTTP, events, queues).

| | |
|---|---|
| **Description** | Used in distributed or service-oriented systems where components are loosely coupled and communicate via messages. |
| **Interface errors** | Message delivered in wrong order; message lost or duplicated; wrong message schema (missing fields, wrong types); deadlock when two components each wait for the other's response; timing-dependent failures. |
| **Example** | Our API → frontend JSON contract: if the API renames `fullName` to `name` without updating the frontend consumer, the profile card renders empty — a message schema mismatch. |

---

### 5. Explain the benefits of test-driven development

Test-Driven Development (TDD) follows the **Red → Green → Refactor** cycle: write a failing test first, write the minimum code to pass it, then clean up.

Benefits:

1. **Guaranteed test coverage** — Every piece of production code exists only because a test demanded it. Coverage is structural, not bolted on afterward.

2. **Forces specification before implementation** — Writing the test first forces the developer to clearly define expected behavior before touching implementation. This surfaces ambiguities early.

3. **Simpler, more focused code** — You only write the code needed to pass the current test. This naturally avoids over-engineering and keeps functions small.

4. **Built-in regression safety** — The accumulated test suite catches unintended side effects whenever anything changes. Refactoring becomes safe.

5. **Tests serve as living documentation** — The test suite describes exactly what the system does, in executable form. New team members can read tests to understand behavior.

6. **Faster debugging** — When a test fails, the scope of the problem is narrow (the last change), so root-cause analysis is much faster.

7. **Encourages modular design** — Code that is hard to test is hard to test *first*, so TDD creates pressure toward loosely-coupled, injectable designs.

---

### 6. Practice requirements-based testing with part of your team project (like the example on slides 53–54)

Requirements-based testing derives test cases systematically from requirements: for each requirement, at least one test case must verify it is satisfied.

**Feature: Company users can shortlist developers**

*From our schema: `Shortlist` table links `companyUserId` ↔ `devUserId` with a unique constraint.*

#### Requirements

| ID | Requirement |
|---|---|
| SL-01 | A company user can add a developer to their shortlist. |
| SL-02 | The same developer cannot be shortlisted twice by the same company. |
| SL-03 | Only a user with `userType = COMPANY` can create a shortlist entry. |
| SL-04 | A company user can remove a developer from their shortlist. |
| SL-05 | A company user can retrieve their full shortlist. |

#### Test Cases

| Test ID | Requirement | Input | Expected Output |
|---|---|---|---|
| TC-SL-01a | SL-01 | Company user POSTs `{ devUserId: "dev_abc" }` | 201 Created; shortlist entry exists in DB |
| TC-SL-01b | SL-01 | Developer user POSTs same request | 403 Forbidden |
| TC-SL-02a | SL-02 | Company user POSTs same `devUserId` twice | Second request → 409 Conflict |
| TC-SL-03a | SL-03 | Unauthenticated request | 401 Unauthorized |
| TC-SL-03b | SL-03 | `userType = DEVELOPER` makes request | 403 Forbidden |
| TC-SL-04a | SL-04 | Company user DELETEs an existing shortlist entry | 204 No Content; entry removed |
| TC-SL-04b | SL-04 | Company user DELETEs a non-existent entry | 404 Not Found |
| TC-SL-05a | SL-05 | Company user GETs `/company/shortlist` | 200 OK; returns array of shortlisted dev profiles |
| TC-SL-05b | SL-05 | Company user with empty shortlist GETs list | 200 OK; returns empty array `[]` |

Each requirement maps to at least one passing test (nominal) and at least one failing test (boundary/error path), following the defect-testing goal from Q1.

---

### 7. Compare three user tests: Alpha, Beta, and Acceptance tests

| Dimension | Alpha Testing | Beta Testing | Acceptance Testing |
|---|---|---|---|
| **Who tests** | Internal team (developers, QA, product) | Real end users — external, selected group | Customer / client / stakeholders |
| **Where** | At the development site, in a controlled environment | At the users' own sites, in real environments | Customer site or agreed environment |
| **Developer presence** | Yes — developers observe and can intervene | No — users operate independently | Typically no; customer evaluates on their own |
| **Stage in lifecycle** | After internal QA, before external release | After alpha, before general availability | Final gate before formal delivery/deployment |
| **Goal** | Find remaining bugs in a near-complete product before external exposure | Discover bugs that emerge in real-world, varied environments | Formally verify the system meets contractual requirements |
| **Error reporting** | Immediate; developers watch sessions | Users file bug reports; no live observation | Pass/fail against acceptance criteria; formal sign-off |
| **Output** | Bug list; developers fix before beta | Bug reports triaged for GA release | Acceptance certificate or rejection |
| **Example in our project** | Internal team walks through the company onboarding → talent discovery → shortlist flow | Invited companies and developers use the live preview deployment and report UX issues | The course instructors/TA evaluate the submitted product against the project rubric |

**Key distinction:** Alpha → controlled internal use; Beta → real-world external use without supervision; Acceptance → formal contractual evaluation by the paying customer or decision-maker.

---

## Questions from you

1. *(to be filled in)*
