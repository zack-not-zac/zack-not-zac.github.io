---
layout: article
Title: Data Structures 2
modified: 2018-04-24
categories: university-projects year-2 code
---

### Data Structures 2 Code (C++)

main.cpp
```c++
//Libraries
#include <iostream>
#include <fstream>
#include <chrono>
#include <cstdlib>
#include <cstdio>
#include <string>
#include <vector>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <Windows.h>
#include "User.h"

//import from libraries
using std::chrono::duration_cast;
using std::chrono::milliseconds;
using std::cout;
using std::cin;
using std::endl;
using std::string;
using std::fstream;
using std::vector;
using std::thread;
using std::mutex;
using std::unique_lock;
using std::condition_variable;
typedef std::chrono::steady_clock the_clock;

//Global variables
mutex clock_mutex;
mutex cv_mutex;
condition_variable pwd_crack_cv;
bool pwd_cracked = false;
string cracked_password = "";
bool end_of_file = false;
vector<int> times;

//function declarations
void setPwdlist(fstream &file, vector<string> &pwdList);
void passwordCrack(vector<string> &pwdList_short, User target);
void createThreads(int threads, vector<string> pwdList, User target);
void shorten_pwdList(vector<string> *pwdList, vector<string>::iterator startPoint, vector<string>::iterator endPoint, User target, int loopCounter);

void main()
{
	string filepath;
	std::vector<string> pwdList;
	fstream wordlist;
	fstream output;
	string input;
	User target;
	const int max_loops = 8;				//number of threads the program will create

	//cout << "Set the target password: " << endl;
	//cin >> input;
	//target.setPassword(input);
	//cout << endl;
	//
	//cout << "Input the filepath of the Dictionary list: " << endl;
	//cin >> filepath;

	//output.open("output.csv");
	//output << "," << endl;
	//output.close();

	//wordlist.open(filepath);

	//debug code
	string debugFilepath = "E:\\Uni Work\\Year 2\\Data Structures and Algorithms 2\\Password_Cracker\\rockyou.txt";
	wordlist.open(debugFilepath);
	target.setPassword(" atlanta.");

	if (!wordlist.is_open())					//checks to see if the file can be opened
	{
		cout << "Error opening file..." << endl;
		getchar();
		return;
	}

	setPwdlist(wordlist, pwdList);				//Calls the function to set the wordlist for the password crack

	wordlist.close();

	cout << "Attempting to crack password..." << endl;
	
	//the_clock::time_point start_total = the_clock::now();		//starts the clock
	for (int threads = 1; threads <= max_loops; threads++)
	{
		createThreads(threads, pwdList, target);

		//reset all variables in the program for the next run
		end_of_file = false;
		pwd_cracked = false;
		cracked_password = "";

		Sleep(1000);						//adds a delay to make sure all resources from last run are freed up by the OS
	}

	//::time_point end_total = the_clock::now();		//stops the clock
	//auto time_taken_total = duration_cast<milliseconds>(end_total - start_total).count();		//calculates the time taken
	
	//cout << endl << "Time taken to complete task: " << time_taken_total << "ms" << endl;
	cout << "Press any key to exit... " << endl;
	getchar();

	getchar();
	return;
}

void setPwdlist(fstream &file, vector<string> &pwdList)
{
	string line;

	cout << "Importing word list..." << endl;

	the_clock::time_point start = the_clock::now();
	while (getline(file, line))
	{
		pwdList.push_back(line);	//adds each line of the file to the vector
	}
	the_clock::time_point end = the_clock::now();
	auto time_taken = duration_cast<milliseconds>(end - start).count();
	
	cout << "Importing word list complete, took " << time_taken << "ms" << endl << endl;

	return;
}

void passwordCrack(vector<string> &pwdList_short, User target)
{
	the_clock::time_point end;
	the_clock::time_point start;

	start = the_clock::now();			//starts the clock

	for (vector<string>::iterator i = pwdList_short.begin(); i < pwdList_short.end(); i++)
	{

		if (target.checkPassword(*i) == true)			//If the password is found
		{
			{
				unique_lock<mutex> lock(clock_mutex);
				end = the_clock::now();						//ends the clock
				auto time_taken = duration_cast<milliseconds>(end - start).count();		//calculates the time taken
				times.push_back(time_taken);				//pushes the time taken to a vector
			}

			{	/*Uses a condition variable to tell the listener function if a password has been found*/
				unique_lock<mutex> lock(cv_mutex);
				cracked_password = *i;
				pwd_cracked = true;
				pwd_crack_cv.notify_one();
			}
			break;
		}
		else if ((i + 1) == pwdList_short.end() && target.checkPassword(*i) == false || pwd_cracked == true)			//if the loop reaches the end of the list and checkPassword is still false
		{																												//or if the password has already been found by another thread
			{
				unique_lock<mutex> lock(clock_mutex);
				end = the_clock::now();						//ends the clock

				auto time_taken = duration_cast<milliseconds>(end - start).count();		//calculates the time taken
				times.push_back(time_taken);
			}
			break;
		}

	}
	return;
}

void shorten_pwdList(vector<string> *pwdList, vector<string>::iterator startPoint, vector<string>::iterator endPoint, User target, int loopCounter)
{
	//auto listLength = size / threads;
	vector<string> pwdList_short;

	pwdList_short.clear();						//makes sure the list is empty

	for (vector<string>::iterator i = startPoint; i < endPoint; i++)
	{
		pwdList_short.push_back(*i);			//creates a shortened version of the wordlist for each thread to use (reduction)
	}

	//{
	//	unique_lock<mutex> lock(startPoint_mutex);
	//	startPoint = startPoint + listLength;				//starts the next thread where the previous one left off
	//}

	passwordCrack(pwdList_short, target);

	return;
}

void find_result()
{
	//condition variable func
	unique_lock<mutex> lock(cv_mutex);

	while (cracked_password == "")
	{
		pwd_crack_cv.wait(lock);
		if (end_of_file == true) { break; }
	}

	if (pwd_cracked == true)
	{
		cout << "Password found! Password is: " << cracked_password << endl;
		return;
	}
	else
	{
		cout << "Password not found! Perhaps try a larger word list?" << endl;
		return;
	}
	
}

int calculate_average()
{/* calculates the average time taken to crack the password (individual thread times are outputted to the output.csv file) */
	int average = 0;

	for (vector<int>::iterator i = times.begin(); i < times.end(); i++)
	{
		average += *i;
	}

	average = average / times.size();

	return average;
}

void createThreads(int threads, vector<string> pwdList, User target)
{
	auto size = pwdList.size();
	vector<thread> threadpool;
	vector<string>::iterator startPoint = pwdList.begin();
	vector<string>::iterator endPoint = (startPoint + (size / threads));
	int loopCounter = 0;
	string output_filepath = "D:\\Uni Work\\Year 2\\Data Structures and Algorithms 2\\Password_Cracker\\output.csv";
	fstream output;
	
	thread result(find_result);

	for (int i = 0; i < threads; i++)
	{
		//create the thread & the task for the thread (passes pwdList by reference)
		threadpool.push_back(thread(shorten_pwdList, &pwdList, startPoint, endPoint, target, loopCounter));		//creates a thread
		
		startPoint = endPoint;								//sets the wordlist startPoint of the next thread to the end of the last thread
		endPoint = (startPoint + (size / threads));			//sets the end of the wordlist for the next thread
		
		loopCounter++;
		
		if ((loopCounter + 1) == threads)			//+1 to loopcounter as threads starts at 1
		{
			end_of_file = true;						//if loopCounter == threads, then the final thread has been created and the program will be modifying the final section of the wordlist
		}
	}

	for (int close_threads = 0; close_threads < threads; close_threads++)
	{
		threadpool[close_threads].join();	//joins the threads the program has created
	}

	{
		unique_lock<mutex> lock(cv_mutex);
		pwd_crack_cv.notify_one();		//Notifies the cv thread that this thread has run and not found a password
	}

	result.join();							//joins the condition variable thread

	output.open("output.csv", std::fstream::out | std::fstream::app);

	if (!output.is_open())					//checks to see if the file can be opened
	{
		cout << "error outputting to file..." << endl;
		getchar();
		return;
	}
	else 
	{
		output << "threads: " << threads << ",";

		for (vector<int>::iterator times_i = times.begin(); times_i < times.end(); times_i++)
		{
			output << *times_i << ",";			//sends thread times to the output.csv file
		}
	}

	output << endl;

	output.close();

	cout << "Time taken for " << threads << " number of threads: " << calculate_average() << "ms" << endl << endl;

	times.clear();								//clears the times vector for the next run

	return;
}

```

User.cpp
```c++
#include "User.h"



User::User()
{
}


User::~User()
{
}

void User::setPassword(string pwd)
{
	password = pwd;		//sets the password of the user
}

bool User::checkPassword(string pwd)
{
	if (pwd == password)
	{
		return true;
	}
	else
	{
		return false;
	}
}
```

User.h
```c++
#pragma once
#include <string>

using std::string;

class User
{
public:
	User();
	~User();

	bool User::checkPassword(string pwd);
	void User::setPassword(string pwd);

private:
	string password;
};


```
