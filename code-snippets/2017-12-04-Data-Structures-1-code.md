---
layout: page
Title: Data Structures 1
modified: 2017-04-12
categories: university-projects year-2 code
---

### Data Structures 1 Code (C++)

main.cpp

```c++
#include <iostream>
#include <string>
#include <chrono>
#include <thread>
#include <stdio.h>      
#include <stdlib.h>     
#include <time.h>
#include <vector>
#include <algorithm>
#include <fstream>
 
using namespace std;
using std::chrono::duration_cast;
using std::chrono::milliseconds;

typedef std::chrono::steady_clock the_clock;
const int maxNumber = 100000;						//max number that can be in the vector
const int loopNum = 10;								//number of times the program will loop (2 for debugging, 5 for real testing)
const int data_loopNum = 11;						//how many times dataMultiplier will multiply dataIncrement	(5 for debugging, 15 for real)
const int dataMultiplier = 2;						//how much the dataIncrement is multiplied by each loop
const int dataIncriment = 100;						//how much the data increments by each time 
//total number of samples = (incriment * multiplier) = incriment (run data_loopNum times)


//function declarations
int generateNums(int choice, int dataSize, vector <int>numbers);
int radixSort(vector<int> numbers);
int bubbleSort(vector<int> numbers);
void printVector(vector<int> numbers);
void exportResults(int time_taken[data_loopNum][loopNum], string filepath);


void main() {
	int choice = 0;
	int time_taken[data_loopNum][loopNum];
	int counter = 0;
	int dataSize = dataIncriment;
	string filepath;
	std::vector<int> numbers;

	cout << endl << "Which sort would you like to test?" << endl;
	cout << "1 -> Radix Sort" << endl;
	cout << "2 -> Bubble Sort" << endl << endl;
	cin >> choice;

	switch (choice) {
	default: return;
	case 1: //call radix sort
		for (counter = 0; counter < loopNum; counter++) {
			filepath = "radix_sort_times.csv";
			for (int data_counter = 0; data_counter < data_loopNum; data_counter++)
			{
				cout << "-----------------------------------------------" << endl;
				cout << "Current number of loops for each data size: " << loopNum << endl;
				for (counter = 0; counter < loopNum; counter++) {
					time_taken[data_counter][counter] = generateNums(choice, dataSize, numbers);
				}

				dataSize = dataSize * dataMultiplier;								//every time the program has looped 5 times for a data size, this will increment the data size by dataIncriment
			}
			exportResults(time_taken, filepath);									//write the time taken to the .csv file
		}
		break;
	case 2: //call bubble sort
		filepath = "bubble_sort_times.csv";
		for (int data_counter = 0; data_counter < data_loopNum; data_counter++)
		{
			cout << "-----------------------------------------------" << endl;
			cout << "Current number of loops for each data size: " << loopNum << endl;
			for (counter = 0; counter < loopNum; counter++) {
				time_taken[data_counter][counter] = generateNums(choice, dataSize, numbers);
			}

			dataSize *= dataMultiplier;									//every time the program has looped 5 times for a data size, this will increment the data size by dataIncriment
		}
		exportResults(time_taken, filepath);							//write the time taken to the .csv file
		break;
	}
}

int generateNums(int choice, int dataSize, vector<int> numbers) {
	int time_taken;

	srand(time(NULL));

	cout << "Generating random numbers..." << endl;

	numbers.empty();

	// Start timing
	the_clock::time_point start = the_clock::now();


	for (int counter = 0; counter < dataSize; counter++)
	{
		int x = rand() % maxNumber + 1;	//Generates a random number between 1 & maxNumber
		numbers.push_back (x);
	}

	// Stop timing
	the_clock::time_point end = the_clock::now();
	// Compute the difference between the two times in milliseconds
	auto time_taken_sort = duration_cast<milliseconds>(end - start).count();

	cout << "Current data size: " << numbers.size() << endl;

	cout << "Number generation complete (" << time_taken_sort << "ms)" << endl;

	if (choice == 1) 
	{
		time_taken = radixSort(numbers);
	}
	else if (choice == 2)
	{
		time_taken = bubbleSort(numbers);
	}
		return time_taken;
}

int radixSort(vector<int> numbers) {
	vector<int>::iterator i;

	// find the max number in the given list (used in loop termination)
	int maxNumber = 0;

	// Start timing
	the_clock::time_point start = the_clock::now();

	for (i = numbers.begin(); i != numbers.end(); i++)
	{
		if (*i > maxNumber)
			maxNumber = *i;
	}

	//run the loop for each of the decimal places
	int exp = 1;
	int *tmpBuffer = new int[numbers.size()];
	while (maxNumber / exp > 0)
	{
		int decimalBucket[10] = { 0 };
		//count the occurences in this decimal digit
		for (i = numbers.begin(); i != numbers.end(); i++)
		{
			decimalBucket[*i / exp % 10]++;			//gets the value of the exp and counts it by adding 1 to the corresponding place in the array
		}
		//Prepare the position counters to be used for re-ordering the numbers for this decimal place
		for (int counter = 1; counter < 10; counter++)
		{
			decimalBucket[counter] += decimalBucket[counter - 1];
		}
		//Re order the numbers in the tmpbuffer and later copy back to original buffer
		for (i = numbers.end() - 1; i >= numbers.begin(); i--)
		{
			tmpBuffer[--decimalBucket[*i / exp % 10]] = *i;

			if (i == numbers.begin())				//checks if the iterator is at the start of the vector to prevent overflow
			{
				break;
			}
		}
		int counter = 0;
		for (i = numbers.begin(); i != numbers.end(); i++)
		{
			*i = tmpBuffer[counter];
			counter++;
		}
		exp *= 10;									//multiply exp by 10 to move to next decimal place

	}

	// Stop timing
	the_clock::time_point end = the_clock::now();

	//printVector(numbers);							//(used for debugging)

	// Compute the difference between the two times in milliseconds
	auto time_taken = duration_cast<milliseconds>(end - start).count();

	cout << "Sorting Complete (" << time_taken << "ms)" << endl << endl;

	return time_taken;
}

int bubbleSort(vector<int> numbers) {
	int counter = 0;
	int swaps = -1;

	// Start timing
	the_clock::time_point start = the_clock::now();

	while (swaps != 0) {
		counter = 0;																		//sets counter back to 0 at the start of each run
		swaps = 0;

		for (vector<int>::iterator i = numbers.begin(); i != numbers.end(); i++) {			//for all items in the vector 
			
			if (i != numbers.end() && (i + 1) == numbers.end())								//checks if the iterator is at the end of the vector to prevent crash
			{
				break;
			}
			else if (*i > *(i + 1))															//if current value > next value
			{
				//iter_swap(numbers.begin() + *i, numbers.begin() + *i + 1);				//old code			
				swap(numbers[counter], numbers[counter + 1]);								//swap them
				 
				swaps++;
			}
			
			counter++;																		//add 1 to counter

		}
	}

	// Stop timing
	the_clock::time_point end = the_clock::now();
	// Compute the difference between the two times in milliseconds
	auto time_taken = duration_cast<milliseconds>(end - start).count();

	cout << "Sorting Complete (" << time_taken << "ms)" << endl << endl;

	//printVector(numbers);																	//used for debugging (not to be used with large samples of data)

	return time_taken;
}

void exportResults(int time_taken[data_loopNum][loopNum], string filepath) {
	ofstream myfile;
	int counter = 0;
	int dataSize = dataIncriment;
	cout << "Writing to file..." << endl;

	myfile.open(filepath);
	myfile << "Data Size,";

	for (int data_counter = 0; data_counter < data_loopNum; data_counter++)
	{
		myfile << (dataSize) << ",";															//prints data size
		dataSize *= dataMultiplier;
	}

	for (counter = 0; counter < loopNum; counter++)
	{
		myfile << endl << "Run " << counter + 1 << "(ms)";										//outputs the run number for each time
		for (int data_counter = 0; data_counter < data_loopNum; data_counter++)				
		{
			myfile << "," << time_taken[data_counter][counter];									//prints time for each data size
		}
	}

	myfile.close();																				//closes the file

	cout << "Writing to file complete." << endl << endl;

	return;
}

void printVector(vector<int> numbers) {
	for (std::vector<int>::iterator i = numbers.begin(); i != numbers.end(); ++i)
	{
		cout << *i << ", ";
	}

	cout << endl;

	return;
}

// Start timing
//the_clock::time_point start = the_clock::now();

// Stop timing
//the_clock::time_point end = the_clock::now();

// Compute the difference between the two times in milliseconds
//auto time_taken = duration_cast<milliseconds>(end - start).count();

```
